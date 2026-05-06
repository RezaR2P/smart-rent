import db from '../config/database.js';

// Hitung denda keterlambatan
const hitungDenda = (end_date, returned_at, feePerDay) => {
  const endDate = new Date(end_date);
  endDate.setHours(0, 0, 0, 0);

  const returnDate = new Date(returned_at);
  returnDate.setHours(0, 0, 0, 0);

  const diffMs = returnDate - endDate;
  const lateDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return lateDays > 0 ? lateDays * feePerDay : 0;
};

// POST proses pengembalian (admin only)
const processReturn = async (req, res) => {
  const { id } = req.params;
  const returned_at = new Date(); // waktu sekarang
  const feePerDay = Number(process.env.LATE_FEE_PER_DAY) || 50000;

  try {
    const [rentals] = await db.query('SELECT * FROM rentals WHERE id = ?', [
      id,
    ]);
    if (rentals.length === 0) {
      return res.status(404).json({ message: 'Rental tidak ditemukan' });
    }

    const rental = rentals[0];

    if (rental.status !== 'active') {
      return res
        .status(400)
        .json({ message: 'Hanya rental aktif yang bisa dikembalikan' });
    }

    const late_fee = hitungDenda(rental.end_date, returned_at, feePerDay);
    const lateDays = late_fee / feePerDay;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Update rental jadi completed
      await conn.query(
        `UPDATE rentals 
         SET status = 'completed', late_fee = ?, returned_at = ? 
         WHERE id = ?`,
        [late_fee, returned_at, id]
      );

      // Kembalikan stok barang
      await conn.query('UPDATE items SET stock = stock + 1 WHERE id = ?', [
        rental.item_id,
      ]);

      await conn.commit();

      res.json({
        message: 'Pengembalian berhasil diproses',
        rentalId: id,
        returned_at,
        late_days: lateDays,
        late_fee,
        fee_per_day: feePerDay,
        total_tagihan: Number(rental.total_price) + late_fee,
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

// GET simulasi denda sebelum proses (admin only)
const simulateDenda = async (req, res) => {
  const { id } = req.params;
  const feePerDay = Number(process.env.LATE_FEE_PER_DAY) || 50000;

  try {
    const [rentals] = await db.query(
      `
      SELECT r.*, i.name AS item_name, u.name AS user_name
      FROM rentals r
      JOIN items i ON r.item_id = i.id
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `,
      [id]
    );

    if (rentals.length === 0) {
      return res.status(404).json({ message: 'Rental tidak ditemukan' });
    }

    const rental = rentals[0];
    const now = new Date();
    const late_fee = hitungDenda(rental.end_date, now, feePerDay);
    const lateDays = late_fee > 0 ? Math.ceil(late_fee / feePerDay) : 0;

    res.json({
      rental_id: rental.id,
      user_name: rental.user_name,
      item_name: rental.item_name,
      end_date: rental.end_date,
      checked_at: now,
      late_days: lateDays,
      late_fee,
      fee_per_day: feePerDay,
      total_price: rental.total_price,
      total_tagihan: Number(rental.total_price) + late_fee,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export { processReturn, simulateDenda };
