const knex = require('../../config/database');

class LedgerReportService {
  async getLedgerReport(companyId, fromDate, toDate, options = {}) {
    const { partyId, ledgerId } = options;
    
    let query = knex('voucher_lines as vl')
      .select(
        'v.voucher_date',
        'v.voucher_number as voucher_no',
        'vl.debit_amount',
        'vl.credit_amount',
        'v.narration',
        'l.ledger_name',
        'l.opening_balance',
        'l.balance_type'
      )
      .join('vouchers as v', 'vl.voucher_id', 'v.id')
      .join('ledgers as l', 'vl.ledger_id', 'l.id')
      .where('vl.company_id', companyId)
      .where('v.is_posted', true)
      .where('v.is_reversed', false)
      .where('v.voucher_date', '>=', fromDate)
      .where('v.voucher_date', '<=', toDate);

    if (partyId) {
      query = query.where('vl.ledger_id', partyId);
    }
    
    if (ledgerId) {
      query = query.where('vl.ledger_id', ledgerId);
    }

    const entries = await query.orderBy('v.voucher_date').orderBy('v.voucher_number');

    const openingQuery = knex('voucher_lines as vl')
      .select(
        knex.raw('SUM(vl.debit_amount) as total_debit'),
        knex.raw('SUM(vl.credit_amount) as total_credit')
      )
      .join('vouchers as v', 'vl.voucher_id', 'v.id')
      .where('vl.company_id', companyId)
      .where('v.is_posted', true)
      .where('v.is_reversed', false)
      .where('v.voucher_date', '<', fromDate);

    if (partyId) {
      openingQuery.where('vl.ledger_id', partyId);
    }
    
    if (ledgerId) {
      openingQuery.where('vl.ledger_id', ledgerId);
    }

    const openingData = await openingQuery.first();
    
    return {
      entries,
      opening_balance: {
        debit: parseFloat(openingData?.total_debit || 0),
        credit: parseFloat(openingData?.total_credit || 0)
      }
    };
  }
}

module.exports = LedgerReportService;