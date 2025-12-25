const express = require('express');
const router = express.Router();
const LedgerReportController = require('../controllers/reports/LedgerReportController');
const StockMovementReportController = require('../controllers/reports/StockMovementReportController');
const TaxSummaryReportController = require('../controllers/reports/TaxSummaryReportController');
const GSTR1ReportController = require('../controllers/reports/GSTR1ReportController');
const GSTR3BReportController = require('../controllers/reports/GSTR3BReportController');
const HSNReportController = require('../controllers/reports/HSNReportController');
const authMiddleware = require('../middleware/auth');

const ledgerReportController = new LedgerReportController();
const stockMovementReportController = new StockMovementReportController();

router.use(authMiddleware);

router.get('/ledger', ledgerReportController.getLedgerReport.bind(ledgerReportController));
router.get('/stock-movements', stockMovementReportController.getStockMovementReport.bind(stockMovementReportController));
router.get('/tax-summary', TaxSummaryReportController.getTaxSummary);
router.get('/gst/gstr1', GSTR1ReportController.getGSTR1Report);
router.get('/gst/gstr3b', GSTR3BReportController.getGSTR3BReport);
router.get('/gst/hsn', HSNReportController.getHSNReport);

module.exports = router;