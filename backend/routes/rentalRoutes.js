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
router.post('/my', verifyToken, getMyRentals);
router.post('/', verifyAdmin, getAllRentals);
router.post('/:id/status', verifyAdmin, updateRentalStatus);

module.exports = router;
