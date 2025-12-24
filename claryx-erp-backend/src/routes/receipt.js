const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', receiptController.getAllReceipts);
router.get('/:id', receiptController.getReceiptById);
router.post('/', receiptController.createReceipt);
router.post('/:id/post', receiptController.updateReceipt);
router.post('/:id/reverse', receiptController.deleteReceipt);

module.exports = router;