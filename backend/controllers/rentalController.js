import db from '../config/database.js';

// POST buat rental baru (user login)
const createRental = async (req, res) => {
  const { item_id, start_date, end_date } = req.body;
  const user_id = req.user.id;
  if (!item_id || !start_date || !end_date) {
    return res
      .status(400)
      .json({ message: 'item_id, start_date, dan end_date Wajib diisi!' });
  }

  try {
    // Cek barang tersedia & stock tersedia
    const [items] = await db.query('SELECT * FROM items WHERE id = ?', [
      item_id,
    ]);
    if (items.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan!' });
    }
    const item = items[0];
    if (item.stock < 1) {
      return res.status(400).json({ message: 'Stok barang tidak tersedia!' });
    }

    // Hitung total harga
    const start = new Date(start_date);
    const end = new Date(end_date);
    const diffMs = end - start;
    if (diffMs <= 0) {
      return res
        .status(400)
        .json({ message: 'Tanggal akhir harus setelah tanggal mulai!' });
    }
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const total_price = days * item.price_per_day;

    // Buat rental & kurangin stock (pakai transaction biar aman)
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO rentals (user_id, item_id, start_date, end_date, total_price) VALUES (?,?,?,?,?)',
        [user_id, item_id, start_date, end_date, total_price]
      );
      await conn.query('UPDATE items SET stock = stock -1 WHERE id = ?', [
        item_id,
      ]);
      await conn.commit();
      res.status(201).json({
        message: 'Rental berhasil dibuat!',
        rentalId: result.insertId,
        total_price,
        days,
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

// GET Semua rental milik user yang login
const getMyRentals = async (req, res) => {
  const user_id = req.user.id;
  try {
    const [rows] = await db.query(
      'SELECT * FROM view_user_rentals WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

// GET Semua rental (admin only)
const getAllRentals = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM view_admin_rentals ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
    });
  }
};

// PATCH Update status rental (admin only)
const updateRentalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatus = ['pending', 'active', 'completed', 'cancelled'];
  if (!validStatus.includes(status)) {
    return res.status(400).json({
      message:
        'Status tidak valid! Pilih salah satu: pending, active, completed, cancelled',
    });
  }

  try {
    const [existing] = await db.query('SELECT * FROM rentals WHERE id = ?', [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rental tidak ditemukan!' });
    }

    // Jika dibatalkan, kembalikan stock barang
    if (status === 'cancelled' && existing[0].status !== 'cancelled') {
      await db.query('UPDATE items SET stock = stock + 1 WHERE id = ?', [
        existing[0].item_id,
      ]);
    }

    await db.query('UPDATE rentals SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Status rental diupdate menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { createRental, getMyRentals, getAllRentals, updateRentalStatus };
