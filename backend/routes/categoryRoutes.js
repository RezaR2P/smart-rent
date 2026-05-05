import express from 'express';
const router = express.Router();
import db from '../config/database.js';
import { verifyAdmin } from '../middlewares/auth.js';

// GET semua kategori (public)
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
  res.json(rows);
});

// POST tambah kategori (admin)
router.post('/', verifyAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name)
    return res.status(400).json({ message: 'Nama kategori wajib diisi' });
  const [result] = await db.query('INSERT INTO categories (name) VALUES (?)', [
    name,
  ]);
  res
    .status(201)
    .json({ message: 'Kategori ditambahkan', id: result.insertId });
});

export default router;
