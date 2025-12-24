const BaseService = require('./BaseService');

class DayBookService extends BaseService {
  constructor(db) {
    super(db);
  }

  async getDayBookEntries(companyId, financialYearId, filters = {}) {
    await this.validateCompany(companyId);
    
    let query = this.enforceCompanyIsolation(
      this.db('vouchers as v')
        .join('voucher_types as vt', 'v.voucher_type_id', 'vt.id')
        .leftJoin('voucher_lines as vl', 'v.id', 'vl.voucher_id')
        .leftJoin('ledgers as l', 'vl.ledger_id', 'l.id')
        .where('v.financial_year_id', financialYearId)
        .where('v.is_posted', true)
        .where('v.is_reversed', false),
      companyId
    );

    if (filters.fromDate) {
      query = query.where('v.voucher_date', '>=', filters.fromDate);
    }
    
    if (filters.toDate) {
      query = query.where('v.voucher_date', '<=', filters.toDate);
    }

    const entries = await query
      .select(
        'v.id as voucher_id',
        'v.voucher_number',
        'v.voucher_date',
        'v.reference_number',
        'v.narration',
        'v.total_amount',
        'vt.name as voucher_type',
        'vl.id as line_id',
        'vl.debit_amount',
        'vl.credit_amount',
        'vl.line_narration',
        'l.name as ledger_name'
      )
      .orderBy('v.voucher_date')
      .orderBy('v.voucher_number');

    return this.groupVoucherLines(entries);
  }

  groupVoucherLines(entries) {
    const vouchersMap = new Map();

    entries.forEach(entry => {
      if (!vouchersMap.has(entry.voucher_id)) {
        vouchersMap.set(entry.voucher_id, {
          voucher_id: entry.voucher_id,
          voucher_number: entry.voucher_number,
          voucher_date: entry.voucher_date,
          reference_number: entry.reference_number,
          narration: entry.narration,
          total_amount: entry.total_amount,
          voucher_type: entry.voucher_type,
          voucher_lines: []
        });
      }

      if (entry.line_id) {
        vouchersMap.get(entry.voucher_id).voucher_lines.push({
          line_id: entry.line_id,
          ledger_name: entry.ledger_name,
          debit_amount: entry.debit_amount,
          credit_amount: entry.credit_amount,
          line_narration: entry.line_narration
        });
      }
    });

    return Array.from(vouchersMap.values());
  }
}

module.exports = DayBookService;