const express = require('express');
const router = express.Router();
const PurchaseController = require('../controllers/PurchaseController');
const authMiddleware = require('../middleware/auth');

const purchaseController = new PurchaseController();

router.use(authMiddleware);

router.post('/', purchaseController.createPurchaseInvoice.bind(purchaseController));
router.post('/:voucherId/reverse', purchaseController.reversePurchaseInvoice.bind(purchaseController));

module.exports = router;