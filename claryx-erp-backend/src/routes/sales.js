const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', salesController.getAllSales);
router.get('/:id', salesController.getSalesById);
router.post('/', salesController.createSales);
router.post('/:id/post', salesController.updateSales);
router.post('/:id/reverse', salesController.deleteSales);

module.exports = router;