import express from 'express';
const router = express.Router();
import {
  processReturn,
  simulateDenda,
} from '../controllers/returnController.js';
import { verifyAdmin } from '../middlewares/auth.js';

router.get('/:id/simulate', verifyAdmin, simulateDenda);
router.post('/:id/return', verifyAdmin, processReturn);

export default router;
