const AuditLogService = require('./AuditLogService');
const BaseService = require('./BaseService');

class InventoryService extends BaseService {
  constructor(knex) {
    super();
    this.knex = knex;
    this.auditLogService = new AuditLogService();
  }

  async createItem(companyId, itemData, userId) {
    return this.knex.transaction(async (trx) => {
      const [itemId] = await trx('inventory_items').insert({
        company_id: companyId,
        ...itemData,
        created_at: new Date(),
        updated_at: new Date()
      });
      
      await this.auditLogService.insertLog({
        companyId,
        userId,
        entityType: 'INVENTORY_ITEM',
        entityId: itemId,
        action: 'CREATE_ITEM',
        metadata: itemData
      }, trx);
      return itemId;
    });
  }

  async createStockMovement(companyId, movementData, userId) {
    return this.knex.transaction(async (trx) => {
      // Check period lock
      await this.assertPeriodOpen(companyId, movementData.movementDate || new Date(), trx);
      
      const [movementId] = await trx('stock_movements').insert({
        company_id: companyId,
        ...movementData,
        created_at: new Date()
      });
      
      if (userId) {
        await this.auditLogService.insertLog({
          companyId,
          userId,
          entityType: 'STOCK_MOVEMENT',
          entityId: movementId,
          action: 'STOCK_MOVEMENT',
          metadata: movementData
        }, trx);
      }
      return movementId;
    });
  }

  async getStockBalance(companyId, itemId, warehouseId = null) {
    let query = this.knex('stock_movements')
      .where('company_id', companyId)
      .where('item_id', itemId)
      .sum(this.knex.raw('CASE WHEN movement_type IN (?, ?) THEN quantity ELSE -quantity END as balance', ['IN', 'ADJUSTMENT_IN']))
      .first();

    if (warehouseId) {
      query = query.where('warehouse_id', warehouseId);
    }

    const result = await query;
    return result.balance || 0;
  }

  async validateStockAvailability(companyId, itemId, requiredQuantity, warehouseId = null) {
    const balance = await this.getStockBalance(companyId, itemId, warehouseId);
    return balance >= requiredQuantity;
  }

  async getStockBalances(companyId, warehouseId = null) {
    let query = this.knex('stock_movements')
      .select('item_id')
      .sum(this.knex.raw('CASE WHEN movement_type IN (?, ?) THEN quantity ELSE -quantity END as balance', ['IN', 'ADJUSTMENT_IN']))
      .where('company_id', companyId)
      .groupBy('item_id');

    if (warehouseId) {
      query = query.where('warehouse_id', warehouseId);
    }

    return query;
  }

  async adjustStock(companyId, itemId, quantity, reason, warehouseId = null, userId) {
    // Check period lock
    await this.assertPeriodOpen(companyId, new Date());
    
    const movementType = quantity > 0 ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT';
    
    const movementId = await this.createStockMovement(companyId, {
      item_id: itemId,
      warehouse_id: warehouseId,
      movement_type: movementType,
      quantity: Math.abs(quantity),
      reference_type: 'ADJUSTMENT',
      notes: reason
    }, userId);
    
    return movementId;
  }
}

module.exports = InventoryService;