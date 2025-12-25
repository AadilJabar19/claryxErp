const BaseService = require('./BaseService');
const AuditLogService = require('./AuditLogService');

class VoucherService extends BaseService {
  constructor(db) {
    super(db);
    this.auditLogService = new AuditLogService();
  }

  async createDraftVoucher(companyId, voucherData, userId) {
    return await this.withTransaction(async (trx) => {
      await this.validateCompany(companyId, trx);
      
      const fy = await this.validateFinancialYear(companyId, voucherData.voucher_date, trx);
      const voucherNumber = await this.generateVoucherNumber(
        companyId, 
        voucherData.voucher_type_id, 
        fy.id, 
        trx
      );

      const voucher = {
        company_id: companyId,
        financial_year_id: fy.id,
        voucher_type_id: voucherData.voucher_type_id,
        voucher_number: voucherNumber,
        voucher_date: voucherData.voucher_date,
        reference_number: voucherData.reference_number,
        narration: voucherData.narration,
        status: 'draft',
        created_at: new Date(),
        updated_at: new Date()
      };

      const [voucherId] = await trx('vouchers').insert(voucher);
      
      if (userId) {
        await this.auditLogService.insertLog({
          companyId,
          userId,
          entityType: 'VOUCHER',
          entityId: voucherId,
          action: 'CREATE_VOUCHER',
          metadata: { voucherNumber, voucherTypeId: voucherData.voucher_type_id }
        }, trx);
      }
      
      return await this.getVoucherById(companyId, voucherId, trx);
    });
  }

  async addVoucherLine(companyId, voucherId, lineData) {
    return await this.withTransaction(async (trx) => {
      const voucher = await this.getVoucherById(companyId, voucherId, trx);
      
      if (voucher.status !== 'draft') {
        throw new Error('Cannot modify posted voucher');
      }

      const line = {
        voucher_id: voucherId,
        ledger_id: lineData.ledger_id,
        debit_amount: lineData.debit_amount || 0,
        credit_amount: lineData.credit_amount || 0,
        narration: lineData.narration,
        created_at: new Date(),
        updated_at: new Date()
      };

      const [lineId] = await trx('voucher_lines').insert(line);
      
      await this.updateVoucherTotals(voucherId, trx);
      
      return await trx('voucher_lines').where('id', lineId).first();
    });
  }

  async validateVoucherForPosting(companyId, voucherId) {
    const voucher = await this.getVoucherById(companyId, voucherId);
    
    if (voucher.status !== 'draft') {
      throw new Error('Voucher is not in draft status');
    }

    const lines = await this.enforceCompanyIsolation(
      this.db('voucher_lines as vl')
        .join('vouchers as v', 'vl.voucher_id', 'v.id')
        .where('vl.voucher_id', voucherId),
      companyId
    ).select('vl.*');

    if (lines.length === 0) {
      throw new Error('Voucher must have at least one line');
    }

    const totalDebits = lines.reduce((sum, line) => sum + parseFloat(line.debit_amount || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + parseFloat(line.credit_amount || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new Error('Voucher is not balanced. Debits must equal credits');
    }

    return { isValid: true, totalAmount: totalDebits };
  }

  async postVoucher(companyId, voucherId, userId) {
    return await this.withTransaction(async (trx) => {
      const validation = await this.validateVoucherForPosting(companyId, voucherId);
      
      await this.enforceCompanyIsolation(
        trx('vouchers').where('id', voucherId),
        companyId
      ).update({
        status: 'posted',
        posted_at: new Date(),
        updated_at: new Date()
      });

      const lines = await this.enforceCompanyIsolation(
        trx('voucher_lines as vl')
          .join('vouchers as v', 'vl.voucher_id', 'v.id')
          .where('vl.voucher_id', voucherId),
        companyId
      ).select('vl.*');

      for (const line of lines) {
        await trx('ledger_balances')
          .where('ledger_id', line.ledger_id)
          .increment('debit_balance', line.debit_amount || 0)
          .increment('credit_balance', line.credit_amount || 0);
      }

      if (userId) {
        await this.auditLogService.insertLog({
          companyId,
          userId,
          entityType: 'VOUCHER',
          entityId: voucherId,
          action: 'POST_VOUCHER',
          metadata: { totalAmount: validation.totalAmount }
        }, trx);
      }

      return await this.getVoucherById(companyId, voucherId, trx);
    });
  }

  async getVoucherById(companyId, voucherId, trx = this.db) {
    const voucher = await this.enforceCompanyIsolation(
      trx('vouchers').where('id', voucherId),
      companyId
    ).first();

    if (!voucher) {
      throw new Error('Voucher not found');
    }

    const lines = await this.enforceCompanyIsolation(
      trx('voucher_lines as vl')
        .join('vouchers as v', 'vl.voucher_id', 'v.id')
        .join('ledgers as l', 'vl.ledger_id', 'l.id')
        .where('vl.voucher_id', voucherId),
      companyId
    ).select('vl.*', 'l.name as ledger_name');

    return {
      ...voucher,
      lines
    };
  }

  async updateVoucherTotals(voucherId, trx) {
    const totals = await trx('voucher_lines')
      .where('voucher_id', voucherId)
      .sum('debit_amount as total_debit')
      .sum('credit_amount as total_credit')
      .first();

    await trx('vouchers')
      .where('id', voucherId)
      .update({
        total_amount: totals.total_debit || 0,
        updated_at: new Date()
      });
  }
}

module.exports = VoucherService;