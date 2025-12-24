const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', inventoryController.getAllInventory);
router.get('/:id', inventoryController.getInventoryById);
router.post('/', inventoryController.createInventory);
router.post('/:id/post', inventoryController.updateInventory);
router.post('/:id/reverse', inventoryController.deleteInventory);

module.exports = router;