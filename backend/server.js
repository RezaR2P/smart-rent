const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import dan gunakan route auth
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// import dan gunakan route crud items (admin & user)
const itemRoutes = require('./routes/itemRoutes');
app.use('/api/items', itemRoutes);

// Route dasar untuk test
app.get('/', (req, res) => {
  res.json({ message: 'Smart-Rent API berjalan! 🚀' });
});

// Tes koneksi database & jalankan server
db.getConnection()
  .then((conn) => {
    console.log('Koneksi database berhasil! 🎉');
    conn.release(); // Lepaskan koneksi setelah tes
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Gagal koneksi ke database:', err);
  });
