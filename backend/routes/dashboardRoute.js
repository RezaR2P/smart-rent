import express from 'express';
const router = express.Router();
import { getDashboardStats } from '../controllers/dashboardController.js';
import { verifyAdmin } from '../middlewares/auth.js';

router.get('/', verifyAdmin, getDashboardStats);

export default router;
