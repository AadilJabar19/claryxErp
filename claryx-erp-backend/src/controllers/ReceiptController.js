const ReceiptService = require('../services/ReceiptService');

class ReceiptController {
  async createReceipt(req, res) {
    try {
      const { companyId } = req.userContext;
      const result = await ReceiptService.createReceipt(req.body, companyId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async reverseReceipt(req, res) {
    try {
      const { companyId } = req.userContext;
      const { voucherId } = req.params;
      const { reason } = req.body;
      const result = await ReceiptService.reverseReceipt(voucherId, companyId, reason);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getReceipts(req, res) {
    try {
      const { companyId } = req.userContext;
      const result = await ReceiptService.getReceipts(companyId, req.query);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ReceiptController;