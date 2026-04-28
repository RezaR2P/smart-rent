import db from '../config/database.js';

// POST upload bukti bayar (user login)
const uploadPayment = async (req, res) => {
  const { rental_id } = req.body;
  const user_id = req.user.id;

  if (!rental_id) {
    return res.status(400).json({ message: 'rental_id wajib diisi' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Bukti pembayaran wajib diupload' });
  }

  try {
    // Pastikan rental milik user ini
    const [rentals] = await db.query(
      'SELECT * FROM rentals WHERE id = ? AND user_id = ?',
      [rental_id, user_id]
    );
    if (rentals.length === 0) {
      return res.status(404).json({ message: 'Rental tidak ditemukan' });
    }

    const rental = rentals[0];
    if (rental.status === 'cancelled') {
      return res.status(400).json({ message: 'Rental sudah dibatalkan' });
    }

    // Cek sudah pernah upload payment belum
    const [existing] = await db.query(
      'SELECT id FROM payments WHERE rental_id = ?',
      [rental_id]
    );
    if (existing.length > 0) {
      return res
        .status(409)
        .json({ message: 'Bukti bayar sudah pernah diupload' });
    }

    const proof_image = req.file.filename;

    const [result] = await db.query(
      `INSERT INTO payments (rental_id, amount, proof_image) VALUES (?, ?, ?)`,
      [rental_id, rental.total_price, proof_image]
    );

    res.status(201).json({
      message: 'Bukti pembayaran berhasil diupload, menunggu verifikasi admin',
      paymentId: result.insertId,
      proof_image,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET semua payment (admin only)
const getAllPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.name AS user_name, u.email, i.name AS item_name, r.start_date, r.end_date
      FROM payments p
      JOIN rentals r ON p.rental_id = r.id
      JOIN users u ON r.user_id = u.id
      JOIN items i ON r.item_id = i.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH verifikasi / tolak payment (admin only)
const verifyPayment = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'verified' atau 'rejected'

  if (!['verified', 'rejected'].includes(status)) {
    return res
      .status(400)
      .json({ message: 'Status harus verified atau rejected' });
  }

  try {
    const [payments] = await db.query('SELECT * FROM payments WHERE id = ?', [
      id,
    ]);
    if (payments.length === 0) {
      return res.status(404).json({ message: 'Payment tidak ditemukan' });
    }

    if (payments[0].status !== 'pending') {
      return res
        .status(400)
        .json({ message: 'Payment sudah diproses sebelumnya' });
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Update status payment
      await conn.query(
        `UPDATE payments SET status = ?, paid_at = ? WHERE id = ?`,
        [status, status === 'verified' ? new Date() : null, id]
      );

      // Kalau verified, update status rental jadi active
      if (status === 'verified') {
        await conn.query('UPDATE rentals SET status = ? WHERE id = ?', [
          'active',
          payments[0].rental_id,
        ]);
      }

      await conn.commit();
      res.json({
        message:
          status === 'verified'
            ? 'Pembayaran diverifikasi, rental aktif!'
            : 'Pembayaran ditolak',
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET payment milik user yang login
const getMyPayments = async (req, res) => {
  const user_id = req.user.id;
  try {
    const [rows] = await db.query(
      `
      SELECT p.*, i.name AS item_name, r.start_date, r.end_date, r.total_price
      FROM payments p
      JOIN rentals r ON p.rental_id = r.id
      JOIN items i ON r.item_id = i.id
      WHERE r.user_id = ?
      ORDER BY p.created_at DESC
    `,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export { uploadPayment, getAllPayments, verifyPayment, getMyPayments };
