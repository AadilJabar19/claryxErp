const InventoryService = require('../services/InventoryService');

class InventoryController {
  constructor() {
    this.inventoryService = new InventoryService();
  }

  async createItem(req, res) {
    try {
      const { companyId } = req.userContext;
      const result = await this.inventoryService.createItem(companyId, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createStockMovement(req, res) {
    try {
      const { companyId } = req.userContext;
      const result = await this.inventoryService.createStockMovement(companyId, req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getStockBalance(req, res) {
    try {
      const { companyId } = req.userContext;
      const { itemId } = req.params;
      const { warehouseId } = req.query;
      const result = await this.inventoryService.getStockBalance(companyId, itemId, warehouseId);
      res.json({ balance: result });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getStockBalances(req, res) {
    try {
      const { companyId } = req.userContext;
      const { warehouseId } = req.query;
      const result = await this.inventoryService.getStockBalances(companyId, warehouseId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async adjustStock(req, res) {
    try {
      const { companyId } = req.userContext;
      const { itemId, quantity, reason, warehouseId } = req.body;
      const result = await this.inventoryService.adjustStock(companyId, itemId, quantity, reason, warehouseId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = InventoryController;