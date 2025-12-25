const StockMovementReportService = require('../../services/reports/StockMovementReportService');

class StockMovementReportController {
  constructor() {
    this.stockMovementReportService = new StockMovementReportService();
  }

  async getStockMovementReport(req, res) {
    try {
      const { companyId } = req.userContext;
      const { from_date, to_date, item_id, warehouse_id } = req.query;

      // Validate required parameters
      if (!from_date || !to_date || !item_id) {
        return res.status(400).json({ error: 'from_date, to_date, and item_id are required' });
      }

      // Get data from service
      const { movements, opening_quantity } = await this.stockMovementReportService.getStockMovementReport(
        companyId,
        from_date,
        to_date,
        item_id,
        warehouse_id
      );

      // Compute running quantity
      let runningQuantity = parseFloat(opening_quantity || 0);
      
      const movementsWithRunning = movements.map(movement => {
        const quantityIn = parseFloat(movement.quantity_in || 0);
        const quantityOut = parseFloat(movement.quantity_out || 0);
        runningQuantity += quantityIn - quantityOut;

        return {
          voucher_date: movement.voucher_date,
          voucher_no: movement.voucher_no,
          movement_type: movement.movement_type,
          quantity_in: quantityIn,
          quantity_out: quantityOut,
          running_quantity: runningQuantity
        };
      });

      const closingQuantity = runningQuantity;

      res.json({
        opening_quantity: parseFloat(opening_quantity || 0),
        movements: movementsWithRunning,
        closing_quantity: closingQuantity
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = StockMovementReportController;