import express from 'express';
const router = express.Router();
import {
  createRental,
  getMyRentals,
  getAllRentals,
  updateRentalStatus,
} from '../controllers/rentalController.js';

import { verifyToken, verifyAdmin } from '../middlewares/auth.js';

// POST buat rental baru (user only)
router.post('/', verifyToken, createRental);
router.get('/my', verifyToken, getMyRentals);
router.get('/', verifyAdmin, getAllRentals);
router.patch('/:id/status', verifyAdmin, updateRentalStatus);

export default router;
