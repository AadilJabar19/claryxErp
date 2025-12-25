const knex = require('../config/database');

class TrialBalanceService {
  async getTrialBalance(companyId, financialYearId) {
    const results = await knex('voucher_entries as ve')
      .select(
        've.ledger_id',
        'l.ledger_name',
        knex.raw('SUM(CASE WHEN ve.entry_type = ? THEN ve.amount ELSE 0 END) as total_debit', ['DEBIT']),
        knex.raw('SUM(CASE WHEN ve.entry_type = ? THEN ve.amount ELSE 0 END) as total_credit', ['CREDIT'])
      )
      .join('ledgers as l', 've.ledger_id', 'l.id')
      .join('vouchers as v', 've.voucher_id', 'v.id')
      .where('ve.company_id', companyId)
      .where('v.financial_year_id', financialYearId)
      .where('v.is_posted', true)
      .where('v.is_reversed', false)
      .groupBy('ve.ledger_id', 'l.ledger_name', 'l.opening_balance', 'l.balance_type')
      .select('l.opening_balance', 'l.balance_type');

    return results.map(row => {
      const openingBalance = parseFloat(row.opening_balance) || 0;
      const totalDebit = parseFloat(row.total_debit) || 0;
      const totalCredit = parseFloat(row.total_credit) || 0;
      
      let closingBalance;
      let balanceType;
      
      if (row.balance_type === 'DEBIT') {
        closingBalance = openingBalance + totalDebit - totalCredit;
        balanceType = closingBalance >= 0 ? 'DEBIT' : 'CREDIT';
        closingBalance = Math.abs(closingBalance);
      } else {
        closingBalance = openingBalance + totalCredit - totalDebit;
        balanceType = closingBalance >= 0 ? 'CREDIT' : 'DEBIT';
        closingBalance = Math.abs(closingBalance);
      }

      return {
        ledger_id: row.ledger_id,
        ledger_name: row.ledger_name,
        total_debit: totalDebit,
        total_credit: totalCredit,
        closing_balance: closingBalance,
        balance_type: balanceType
      };
    });
  }
}

module.exports = TrialBalanceService;