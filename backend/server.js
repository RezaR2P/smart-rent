import express from 'express';
import cors from 'cors';

import db from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.use('/api/items', itemRoutes);

app.use('/api/rentals', rentalRoutes);

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
