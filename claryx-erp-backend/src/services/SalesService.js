const BaseService = require('./BaseService');
const VoucherService = require('./VoucherService');
const InventoryService = require('./InventoryService');
const AuditLogService = require('./AuditLogService');

class SalesService extends BaseService {
  constructor() {
    super();
    this.voucherService = new VoucherService();
    this.inventoryService = new InventoryService();
    this.auditLogService = new AuditLogService();
  }

  async createSalesInvoice(data, autoPost = false) {
    const { companyId, financialYearId, partyId, items, userId, ...voucherData } = data;
    
    return this.executeInTransaction(async (trx) => {
      // Validate company context
      await this.validateCompany(companyId, trx);
      
      // Validate financial year
      await this.validateFinancialYear(financialYearId, trx);
      
      // Check period lock
      await this.assertPeriodOpen(companyId, voucherData.voucherDate || new Date(), trx);
      
      // Validate party exists
      await this.validateParty(partyId, trx);
      
      // Validate stock availability
      await this.validateStockAvailability(companyId, items, trx);
      
      // Create sales voucher (DRAFT)
      const voucher = await this.voucherService.createVoucher({
        ...voucherData,
        companyId,
        financialYearId,
        voucherType: 'SALES',
        status: 'DRAFT'
      }, trx);
      
      let totalAmount = 0;
      
      // Add sales ledger lines and create stock movements
      for (const item of items) {
        const amount = item.quantity * item.rate;
        totalAmount += amount;
        
        // Add sales ledger line (CREDIT)
        await this.voucherService.addLedgerLine(voucher.id, {
          ledgerId: item.salesLedgerId,
          debit: 0,
          credit: amount,
          description: `Sale of ${item.description || 'item'}`
        }, trx);
        
        // Create stock movement (OUT)
        if (item.stockItemId) {
          await this.inventoryService.createStockMovement({
            companyId,
            stockItemId: item.stockItemId,
            voucherId: voucher.id,
            movementType: 'OUT',
            quantity: item.quantity,
            rate: item.rate,
            amount: amount
          }, trx);
        }
      }
      
      // Add party ledger line (DEBIT)
      await this.voucherService.addLedgerLine(voucher.id, {
        ledgerId: partyId,
        debit: totalAmount,
        credit: 0,
        description: 'Sales invoice'
      }, trx);
      
      // Log audit
      await this.auditLogService.insertLog({
        companyId,
        userId,
        entityType: 'SALES',
        entityId: voucher.id,
        action: 'CREATE_SALES',
        metadata: { totalAmount, partyId }
      }, trx);
      
      // Post voucher if autoPost is true
      if (autoPost) {
        await this.voucherService.postVoucher(voucher.id, trx);
        await this.auditLogService.insertLog({
          companyId,
          userId,
          entityType: 'SALES',
          entityId: voucher.id,
          action: 'POST_SALES',
          metadata: { totalAmount }
        }, trx);
      }
      
      return voucher;
    });
  }

  async reverseSalesInvoice(voucherId, userId) {
    return this.executeInTransaction(async (trx) => {
      // Get original voucher
      const originalVoucher = await this.voucherService.getVoucher(voucherId, trx);
      if (!originalVoucher) {
        throw new Error('Voucher not found');
      }
      
      if (originalVoucher.status === 'REVERSED') {
        throw new Error('Voucher already reversed');
      }
      
      // Check period lock
      await this.assertPeriodOpen(originalVoucher.companyId, new Date(), trx);
      
      // Get ledger lines and stock movements
      const ledgerLines = await this.voucherService.getLedgerLines(voucherId, trx);
      const stockMovements = await this.inventoryService.getStockMovements(voucherId, trx);
      
      // Create reversal voucher
      const reversalVoucher = await this.voucherService.createVoucher({
        companyId: originalVoucher.companyId,
        financialYearId: originalVoucher.financialYearId,
        voucherType: 'SALES_REVERSAL',
        status: 'DRAFT',
        referenceVoucherId: voucherId,
        description: `Reversal of ${originalVoucher.voucherNumber}`
      }, trx);
      
      // Create reverse ledger lines (swap debit/credit)
      for (const line of ledgerLines) {
        await this.voucherService.addLedgerLine(reversalVoucher.id, {
          ledgerId: line.ledgerId,
          debit: line.credit,
          credit: line.debit,
          description: `Reversal: ${line.description}`
        }, trx);
      }
      
      // Create reverse stock movements (IN)
      for (const movement of stockMovements) {
        await this.inventoryService.createStockMovement({
          companyId: movement.companyId,
          stockItemId: movement.stockItemId,
          voucherId: reversalVoucher.id,
          movementType: 'IN',
          quantity: movement.quantity,
          rate: movement.rate,
          amount: movement.amount
        }, trx);
      }
      
      // Post reversal voucher
      await this.voucherService.postVoucher(reversalVoucher.id, trx);
      
      // Mark original voucher as REVERSED
      await this.voucherService.updateVoucherStatus(voucherId, 'REVERSED', trx);
      
      // Log audit
      await this.auditLogService.insertLog({
        companyId: originalVoucher.companyId,
        userId,
        entityType: 'SALES',
        entityId: voucherId,
        action: 'REVERSE_SALES',
        metadata: { reversalVoucherId: reversalVoucher.id }
      }, trx);
      
      return reversalVoucher;
    });
  }

  async validateCompany(companyId, trx) {
    const company = await trx('companies').where('id', companyId).first();
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }

  async validateFinancialYear(financialYearId, trx) {
    const fy = await trx('financial_years').where('id', financialYearId).first();
    if (!fy) {
      throw new Error('Financial year not found');
    }
    if (fy.status !== 'ACTIVE') {
      throw new Error('Financial year is not active');
    }
    return fy;
  }

  async validateParty(partyId, trx) {
    const party = await trx('ledgers').where('id', partyId).first();
    if (!party) {
      throw new Error('Party not found');
    }
    return party;
  }

  async validateStockAvailability(companyId, items, trx) {
    for (const item of items) {
      if (item.stockItemId) {
        const available = await this.inventoryService.getAvailableStock(
          companyId, 
          item.stockItemId, 
          trx
        );
        
        if (available < item.quantity) {
          throw new Error(`Insufficient stock for item ${item.stockItemId}. Available: ${available}, Required: ${item.quantity}`);
        }
      }
    }
  }
}

module.exports = SalesService;