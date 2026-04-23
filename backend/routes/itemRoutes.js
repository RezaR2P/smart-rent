const exporess = require('express');
const router = exporess.Router();
const {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/itemController');
const { verifyAdmin } = require('../middlewares/auth');

router.get('/', getAllItems);
router.get('/:id', getItemById);
router.post('/', verifyAdmin, createItem);
router.put('/:id', verifyAdmin, updateItem);
router.delete('/:id', verifyAdmin, deleteItem);

module.exports = router;
