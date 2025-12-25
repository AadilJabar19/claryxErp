const express = require('express');
const router = express.Router();
const SalesController = require('../controllers/SalesController');
const authMiddleware = require('../middleware/auth');

const salesController = new SalesController();

router.use(authMiddleware);

router.post('/', salesController.createSalesInvoice.bind(salesController));
router.post('/:voucherId/reverse', salesController.reverseSalesInvoice.bind(salesController));

module.exports = router;