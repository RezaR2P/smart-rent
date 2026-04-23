const db = require('../config/database');

// get semua barang (admin & user)
const getAllItems = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT i.*, c.name as category_name FROM items i LEFT JOIN categories c ON i.category_id = c.id ORDER BY i.created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// GET satu barang berdasarkan ID (admin & user)
const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT i.*, c.name AS category_name FROM items i LEFT JOIN categories c ON i.category_id = c.id WHERE i.id = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// POST tambah barang (admin only)

const createItem = async (req, res) => {
  const { category_id, name, description, price_per_day, stock, image_url } =
    req.body;

  if (!name || !price_per_day || !image_url) {
    return res.status(400).json({ message: 'Semua field harus diisi' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO items (category_id, name, description, price_per_day, stock, image_url ) VALUES (?,?,?,?,?,?)',
      [
        category_id || null,
        name,
        description || null,
        price_per_day,
        stock || 1,
        image_url,
      ]
    );
    res.status(201).json({
      message: 'Barang berhasil ditambahkan',
      itemId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
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
      'UPDATE items SET category_id = ?, name = ?, description=?, price_per_day=?, stock=?, image_url=? WHERE id =?',
      [
        category_id || null,
        name,
        description || null,
        price_per_day,
        stock || 1,
        image_url,
        id,
      ]
    );
    res.json({ message: 'Barang berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
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

    await db.query('DELETE FROM items WHERE id =?', [id]);
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
};
