const PurchaseService = require('../services/PurchaseService');

class PurchaseController {
  constructor() {
    this.purchaseService = new PurchaseService();
  }

  async createPurchaseInvoice(req, res) {
    try {
      const { companyId } = req.userContext;
      const autoPost = req.body.autoPost || false;
      const result = await this.purchaseService.createPurchaseInvoice({ ...req.body, companyId }, autoPost);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async reversePurchaseInvoice(req, res) {
    try {
      const { voucherId } = req.params;
      const result = await this.purchaseService.reversePurchaseInvoice(voucherId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = PurchaseController;