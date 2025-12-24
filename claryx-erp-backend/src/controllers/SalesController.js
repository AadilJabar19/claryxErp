const SalesService = require('../services/SalesService');

class SalesController {
  constructor() {
    this.salesService = new SalesService();
  }

  async createSalesInvoice(req, res) {
    try {
      const { companyId } = req.userContext;
      const autoPost = req.body.autoPost || false;
      const result = await this.salesService.createSalesInvoice({ ...req.body, companyId }, autoPost);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async reverseSalesInvoice(req, res) {
    try {
      const { voucherId } = req.params;
      const result = await this.salesService.reverseSalesInvoice(voucherId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = SalesController;