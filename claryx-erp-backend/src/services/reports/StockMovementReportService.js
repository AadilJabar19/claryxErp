const knex = require('../../config/database');

class StockMovementReportService {
  async getStockMovementReport(companyId, fromDate, toDate, itemId, warehouseId = null) {
    if (!itemId) {
      throw new Error('item_id is required');
    }

    // Get opening quantity before from_date
    const openingQuery = knex('stock_movements as sm')
      .select(knex.raw('COALESCE(SUM(sm.quantity), 0) as opening_quantity'))
      .join('vouchers as v', 'sm.voucher_id', 'v.id')
      .where('sm.company_id', companyId)
      .where('sm.item_id', itemId)
      .where('v.is_posted', true)
      .where('v.is_reversed', false)
      .where('v.voucher_date', '<', fromDate);

    if (warehouseId) {
      openingQuery.where('sm.warehouse_id', warehouseId);
    }

    const openingResult = await openingQuery.first();

    // Get movements within date range
    const movementsQuery = knex('stock_movements as sm')
      .select(
        'v.voucher_date',
        'v.voucher_number',
        'sm.quantity',
        'sm.rate',
        'sm.amount',
        'sm.movement_type',
        'sm.warehouse_id'
      )
      .join('vouchers as v', 'sm.voucher_id', 'v.id')
      .where('sm.company_id', companyId)
      .where('sm.item_id', itemId)
      .where('v.is_posted', true)
      .where('v.is_reversed', false)
      .where('v.voucher_date', '>=', fromDate)
      .where('v.voucher_date', '<=', toDate);

    if (warehouseId) {
      movementsQuery.where('sm.warehouse_id', warehouseId);
    }

    const movements = await movementsQuery
      .orderBy('v.voucher_date', 'asc')
      .orderBy('sm.id', 'asc');

    return {
      opening_quantity: parseFloat(openingResult?.opening_quantity || 0),
      movements
    };
  }
}

module.exports = StockMovementReportService;