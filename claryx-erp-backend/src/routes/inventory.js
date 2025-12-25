const express = require('express');
const router = express.Router();
const InventoryController = require('../controllers/InventoryController');
const authMiddleware = require('../middleware/auth');

const inventoryController = new InventoryController();

router.use(authMiddleware);

router.post('/items', inventoryController.createItem.bind(inventoryController));
router.post('/stock-movement', inventoryController.createStockMovement.bind(inventoryController));
router.get('/stock-balance/:itemId', inventoryController.getStockBalance.bind(inventoryController));
router.get('/stock-balances', inventoryController.getStockBalances.bind(inventoryController));
router.post('/adjust-stock', inventoryController.adjustStock.bind(inventoryController));

module.exports = router;