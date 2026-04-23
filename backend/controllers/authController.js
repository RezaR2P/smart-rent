const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Semua field Wajib diisi!' });
  }
  try {
    // Cek apakah email sudah terdaftar
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar!' });
    }

    // Hash password sebelum disimpan
    const hashed = await bcrypt.hash(password, 10);

    // Simpan user baru
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed]
    );
    res
      .status(201)
      .json({ message: 'Registrasi berhasil', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  try {
    // Cari user
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = rows[0];

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login };
