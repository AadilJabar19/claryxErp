const BaseService = require('./BaseService');

class PartyOutstandingService extends BaseService {
  constructor(db) {
    super(db);
  }

  async getPartyOutstanding(companyId, financialYearId, filters = {}) {
    await this.validateCompany(companyId);
    
    let query = this.enforceCompanyIsolation(
      this.db('voucher_lines as vl')
        .join('vouchers as v', 'vl.voucher_id', 'v.id')
        .join('voucher_types as vt', 'v.voucher_type_id', 'vt.id')
        .join('ledgers as l', 'vl.ledger_id', 'l.id')
        .join('chart_of_accounts as coa', 'l.account_id', 'coa.id')
        .where('v.financial_year_id', financialYearId)
        .where('v.is_posted', true)
        .where('v.is_reversed', false)
        .whereIn('vt.voucher_category', ['SALES', 'RECEIPT'])
        .where('coa.account_type', 'ASSET'),
      companyId
    );

    if (filters.partyId) {
      query = query.where('l.id', filters.partyId);
    }

    const entries = await query
      .select(
        'l.id as party_id',
        'l.ledger_name as party_name',
        'vt.voucher_category',
        this.db.raw('SUM(vl.debit_amount - vl.credit_amount) as net_amount')
      )
      .groupBy('l.id', 'l.ledger_name', 'vt.voucher_category');

    return this.calculateOutstanding(entries);
  }

  calculateOutstanding(entries) {
    const partyMap = new Map();

    entries.forEach(entry => {
      if (!partyMap.has(entry.party_id)) {
        partyMap.set(entry.party_id, {
          party_id: entry.party_id,
          party_name: entry.party_name,
          sales_amount: 0,
          receipt_amount: 0,
          outstanding_amount: 0
        });
      }

      const party = partyMap.get(entry.party_id);
      const amount = parseFloat(entry.net_amount || 0);

      if (entry.voucher_category === 'SALES') {
        party.sales_amount += amount;
      } else if (entry.voucher_category === 'RECEIPT') {
        party.receipt_amount += amount;
      }
    });

    return Array.from(partyMap.values()).map(party => ({
      ...party,
      outstanding_amount: party.sales_amount - party.receipt_amount
    })).filter(party => Math.abs(party.outstanding_amount) > 0.01);
  }
}

module.exports = PartyOutstandingService;