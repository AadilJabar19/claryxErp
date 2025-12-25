const GSTR3BReportService = require('../../services/reports/GSTR3BReportService');

class GSTR3BReportController {
  static async getGSTR3BReport(req, res) {
    try {
      const { from_date, to_date } = req.query;
      
      if (!from_date || !to_date) {
        return res.status(400).json({
          error: 'from_date and to_date are required'
        });
      }

      const companyId = req.user.company_id;
      const result = await GSTR3BReportService.getGSTR3BReport(companyId, from_date, to_date);
      
      res.json({
        period: { from_date, to_date },
        section_3_1: result.section_3_1,
        section_4: result.section_4
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = GSTR3BReportController;