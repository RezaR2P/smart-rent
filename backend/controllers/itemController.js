const db = require('../config/database');

// GET semua barang (public)
const getAllItems = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT i.*, c.name AS category_name 
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET satu barang by ID (public)
const getItemById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      `
      SELECT i.*, c.name AS category_name 
      FROM items i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST tambah barang (admin only)
const createItem = async (req, res) => {
  const { category_id, name, description, price_per_day, stock, image_url } =
    req.body;

  if (!name || !price_per_day) {
    return res.status(400).json({ message: 'Nama dan harga wajib diisi' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO items (category_id, name, description, price_per_day, stock, image_url) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category_id || null,
        name,
        description || null,
        price_per_day,
        stock || 1,
        image_url || null,
      ]
    );
    res.status(201).json({
      message: 'Barang berhasil ditambahkan',
      itemId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT update barang (admin only)
const updateItem = async (req, res) => {
  const { id } = req.params;
  const { category_id, name, description, price_per_day, stock, image_url } =
    req.body;

  try {
    const [existing] = await db.query('SELECT id FROM items WHERE id = ?', [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    await db.query(
      `UPDATE items SET category_id=?, name=?, description=?, price_per_day=?, stock=?, image_url=? 
       WHERE id=?`,
      [
        category_id || null,
        name,
        description || null,
        price_per_day,
        stock,
        image_url || null,
        id,
      ]
    );
    res.json({ message: 'Barang berhasil diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE barang (admin only)
const deleteItem = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query('SELECT id FROM items WHERE id = ?', [
      id,
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    await db.query('DELETE FROM items WHERE id = ?', [id]);
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
