const TaxSummaryReportService = require('../../services/reports/TaxSummaryReportService');
const { authenticateJWT } = require('../../middleware/auth');

class TaxSummaryReportController {
  static async getTaxSummary(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({
          error: 'from_date and to_date are required'
        });
      }

      const companyId = req.user.company_id;
      const result = await TaxSummaryReportService.getTaxSummary(companyId, from_date, to_date);
      
      res.json({
        outward_supplies: result.outward_supplies,
        inward_supplies: result.inward_supplies,
        totals: {
          outward_taxable: result.summary.total_outward_taxable,
          outward_tax: result.summary.total_outward_tax,
          inward_taxable: result.summary.total_inward_taxable,
          inward_tax: result.summary.total_inward_tax
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TaxSummaryReportController;