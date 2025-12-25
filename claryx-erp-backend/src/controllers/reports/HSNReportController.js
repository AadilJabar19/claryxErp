const HSNReportService = require('../../services/reports/HSNReportService');

class HSNReportController {
  static async getHSNReport(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({
          error: 'from_date and to_date are required'
        });
      }

      const companyId = req.user.company_id;
      const result = await HSNReportService.getHSNReport(companyId, from_date, to_date);
      
      res.json({
        period: { from_date, to_date },
        hsn: result.hsn_data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = HSNReportController;