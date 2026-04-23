const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Akses ditolak, Token tidak ditemukan!' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Simpan data user yang terverifikasi di request
    next(); // Lanjut ke middleware berikutnya atau route handler
  } catch (error) {
    res
      .status(403)
      .json({ message: 'Token tidak valid atau sudah kadaluarsa!' });
  }
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Akses ditolak, hanya admin yang bisa mengakses!' });
    }
  });
};

module.exports = { verifyToken, verifyAdmin };
