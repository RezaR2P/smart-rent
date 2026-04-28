import express from 'express';
const router = express.Router();
import {
  uploadPayment,
  getAllPayments,
  verifyPayment,
  getMyPayments,
} from '../controllers/paymentController.js';
import { verifyToken, verifyAdmin } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';

router.post('/', verifyToken, upload.single('proof_image'), uploadPayment);
router.get('/my', verifyToken, getMyPayments);
router.get('/', verifyAdmin, getAllPayments);
router.patch('/:id/verify', verifyAdmin, verifyPayment);

export default router;
