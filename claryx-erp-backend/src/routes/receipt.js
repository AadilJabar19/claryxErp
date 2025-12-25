const express = require('express');
const router = express.Router();
const ReceiptController = require('../controllers/ReceiptController');
const authMiddleware = require('../middleware/auth');

const receiptController = new ReceiptController();

router.use(authMiddleware);

router.post('/', receiptController.createReceipt.bind(receiptController));
router.post('/:voucherId/reverse', receiptController.reverseReceipt.bind(receiptController));

module.exports = router;