const GSTR1ReportService = require('../../services/reports/GSTR1ReportService');

class GSTR1ReportController {
  static async getGSTR1Report(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({
          error: 'from_date and to_date are required'
        });
      }

      const companyId = req.user.company_id;
      const result = await GSTR1ReportService.getGSTR1Report(companyId, from_date, to_date);
      
      res.json({
        period: {
          from_date,
          to_date
        },
        b2b: result.b2b,
        b2c: result.b2c
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = GSTR1ReportController;