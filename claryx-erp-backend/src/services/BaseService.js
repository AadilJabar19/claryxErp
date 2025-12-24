const knex = require('knex');

class BaseService {
  constructor(db) {
    this.db = db;
  }

  async withTransaction(callback) {
    const trx = await this.db.transaction();
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async validateCompany(companyId, trx = this.db) {
    const company = await trx('companies')
      .where('id', companyId)
      .where('is_active', true)
      .first();
    
    if (!company) {
      throw new Error('Invalid or inactive company');
    }
    return company;
  }

  async validateFinancialYear(companyId, date, trx = this.db) {
    const fy = await trx('financial_years')
      .where('company_id', companyId)
      .where('start_date', '<=', date)
      .where('end_date', '>=', date)
      .where('is_active', true)
      .first();
    
    if (!fy) {
      throw new Error('No active financial year found for the date');
    }
    return fy;
  }

  async generateVoucherNumber(companyId, voucherTypeId, financialYearId, trx = this.db) {
    const voucherType = await trx('voucher_types')
      .where('id', voucherTypeId)
      .where('company_id', companyId)
      .first();
    
    if (!voucherType) {
      throw new Error('Invalid voucher type');
    }

    const sequence = await trx('document_sequences')
      .where('company_id', companyId)
      .where('voucher_type_id', voucherTypeId)
      .where('financial_year_id', financialYearId)
      .forUpdate()
      .first();

    if (!sequence) {
      const error = new Error('Document sequence not found');
      error.code = 'DOCUMENT_SEQUENCE_NOT_FOUND';
      throw error;
    }

    const nextNumber = sequence.current_number + 1;
    
    await trx('document_sequences')
      .where('id', sequence.id)
      .update({ current_number: nextNumber });

    return `${voucherType.prefix}${nextNumber.toString().padStart(6, '0')}${voucherType.suffix || ''}`;
  }

  enforceCompanyIsolation(query, companyId) {
    return query.where('company_id', companyId);
  }

  async getCurrentFinancialYear(companyId, trx = this.db) {
    return await trx('financial_years')
      .where('company_id', companyId)
      .where('is_current', true)
      .where('is_active', true)
      .first();
  }

  async assertPeriodOpen(companyId, date, trx = this.db) {
    const period = await trx('accounting_periods')
      .where('company_id', companyId)
      .where('start_date', '<=', date)
      .where('end_date', '>=', date)
      .where('is_locked', true)
      .first();
    
    if (period) {
      const error = new Error('Cannot modify transactions in a locked accounting period');
      error.code = 'ACCOUNTING_PERIOD_LOCKED';
      throw error;
    }
  }
}

module.exports = BaseService;