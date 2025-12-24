const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', purchaseController.getAllPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', purchaseController.createPurchase);
router.post('/:id/post', purchaseController.updatePurchase);
router.post('/:id/reverse', purchaseController.deletePurchase);

module.exports = router;