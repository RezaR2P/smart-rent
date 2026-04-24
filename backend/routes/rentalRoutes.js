const express = require('express');
const router = express.Router();
const {
  createRental,
  getMyRentals,
  getAllRentals,
  updateRentalStatus,
} = require('../controllers/rentalController');

const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// POST buat rental baru (user only)
router.post('/', verifyToken, createRental);
router.get('/my', verifyToken, getMyRentals);
router.get('/', verifyAdmin, getAllRentals);
router.patch('/:id/status', verifyAdmin, updateRentalStatus);

module.exports = router;
