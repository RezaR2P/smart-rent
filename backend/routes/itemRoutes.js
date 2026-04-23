const exporess = require('express');
const router = exporess.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemControllers');
const { verifyAdmin } = require('../middlewares/auth');

router.get('/', getAllItems);
router.get('/:id', getItemById);
router.post('/', createItem, verifyAdmin);
router.put('/:id', updateItem, verifyAdmin);
router.delete('/:id', deleteItem, verifyAdmin);
