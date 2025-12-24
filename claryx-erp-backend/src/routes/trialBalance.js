const express = require('express');
const router = express.Router();
const TrialBalanceController = require('../controllers/TrialBalanceController');
const authMiddleware = require('../middleware/auth');

const trialBalanceController = new TrialBalanceController();

router.use(authMiddleware);

router.get('/trial-balance', trialBalanceController.getTrialBalance.bind(trialBalanceController));

module.exports = router;