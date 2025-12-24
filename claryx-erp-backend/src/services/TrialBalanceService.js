const BaseService = require('./BaseService');

class TrialBalanceService extends BaseService {
  async getTrialBalance(companyId, financialYearId) {
    await this.validateCompany(companyId);
    
    const trialBalance = await this.db('voucher_lines as vl')
      .join('vouchers as v', 'vl.voucher_id', 'v.id')
      .join('ledgers as l', 'vl.ledger_id', 'l.id')
      .select(
        'l.id as ledger_id',
        'l.ledger_code',
        'l.ledger_name',
        this.db.raw('SUM(vl.debit_amount) as debit'),
        this.db.raw('SUM(vl.credit_amount) as credit'),
        this.db.raw('SUM(vl.debit_amount) - SUM(vl.credit_amount) as balance')
      )
      .where('v.company_id', companyId)
      .where('v.financial_year_id', financialYearId)
      .where('v.is_posted', true)
      .where('v.is_reversed', false)
      .groupBy('l.id', 'l.ledger_code', 'l.ledger_name')
      .orderBy('l.ledger_code');

    return trialBalance.map(row => ({
      ledger_id: row.ledger_id,
      ledger_code: row.ledger_code,
      ledger_name: row.ledger_name,
      debit: parseFloat(row.debit) || 0,
      credit: parseFloat(row.credit) || 0,
      balance: parseFloat(row.balance) || 0
    }));
  }
}

module.exports = TrialBalanceService;