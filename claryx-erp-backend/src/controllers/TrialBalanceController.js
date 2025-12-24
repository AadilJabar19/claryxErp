const TrialBalanceService = require('../services/TrialBalanceService');
const knex = require('../config/database');

class TrialBalanceController {
  constructor() {
    this.trialBalanceService = new TrialBalanceService(knex);
  }

  async getTrialBalance(req, res) {
    try {
      const { companyId } = req.userContext;
      const { financialYearId } = req.query;
      
      if (!financialYearId) {
        return res.status(400).json({ error: 'financialYearId is required' });
      }

      const result = await this.trialBalanceService.getTrialBalance(companyId, financialYearId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = TrialBalanceController;