import express from 'express';
import cors from 'cors';

import db from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoute from './routes/dashboardRoute.js';
import categoryRoutes from './routes/categoryRoutes.js';
import returnRoutes from './routes/returnRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS dulu sebelum static files
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.use('/api/items', itemRoutes);

app.use('/api/rentals', rentalRoutes);

app.use('/api/payments', paymentRoutes);

app.use('/api/dashboard', dashboardRoute);

app.use('/api/categories', categoryRoutes);

app.use('/api/rentals', returnRoutes);

// Static files dengan header CORS eksplisit
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static('uploads')
);

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
