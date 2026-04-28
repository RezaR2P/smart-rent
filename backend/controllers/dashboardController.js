import db from '../config/database.js';

const getDashboardStats = async (req, res) => {
  try {
    // Total Pendapatan dari pembayaran yang sudah diverifikasi
    const [[{ total_pendapatan }]] =
      await db.query(`SELECT COALESCE(SUM(amount), 0) AS total_pendapatan
      FROM payments
      WHERE status = 'verified'`);
    // Total Rental per status
    const [rentalStats] = await db.query(`SELECT status, COUNT(*) AS total
      FROM rentals
      GROUP BY status`);

    // Total user terdaftar
    const [[{ total_users }]] = await db.query(`
      SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'
    `);

    // Total barang
    const [[{ total_items }]] = await db.query(`
      SELECT COUNT(*) AS total_items FROM items
    `);

    // Pendapatan per bulan (12 bulan terakhir)
    const [pendapatanBulanan] = await db.query(`
      SELECT 
        DATE_FORMAT(paid_at, '%Y-%m') AS bulan,
        SUM(amount) AS total
      FROM payments
      WHERE status = 'verified'
        AND paid_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY bulan
      ORDER BY bulan ASC
    `);

    // 5 barang paling sering disewa
    const [topItems] = await db.query(`
      SELECT i.name, COUNT(r.id) AS total_sewa
      FROM rentals r
      JOIN items i ON r.item_id = i.id
      WHERE r.status != 'cancelled'
      GROUP BY r.item_id, i.name
      ORDER BY total_sewa DESC
      LIMIT 5
    `);

    // Payment pending yang belum diverifikasi
    const [[{ pending_payments }]] = await db.query(`
      SELECT COUNT(*) AS pending_payments
      FROM payments
      WHERE status = 'pending'
    `);
    res.json({
      ringkasan: {
        total_pendapatan,
        total_users,
        total_items,
        pending_payments,
      },
      rental_stats: rentalStats,
      pendapatan_bulanan: pendapatanBulanan,
      top_items: topItems,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export { getDashboardStats };
