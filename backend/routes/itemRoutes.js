import express from 'express';
const router = express.Router();
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from '../controllers/itemController.js';
import { verifyAdmin } from '../middlewares/auth.js';

router.get('/', getAllItems);
router.get('/:id', getItemById);
router.post('/', verifyAdmin, createItem);
router.put('/:id', verifyAdmin, updateItem);
router.delete('/:id', verifyAdmin, deleteItem);

export default router;
