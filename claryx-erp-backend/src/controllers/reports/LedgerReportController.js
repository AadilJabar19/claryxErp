const LedgerReportService = require('../../services/reports/LedgerReportService');

class LedgerReportController {
  constructor() {
    this.ledgerReportService = new LedgerReportService();
  }

  async getLedgerReport(req, res) {
    try {
      const { companyId } = req.userContext;
      const { from_date, to_date, ledger_id, party_id } = req.query;

      // Validate required parameters
      if (!from_date || !to_date) {
        return res.status(400).json({ error: 'from_date and to_date are required' });
      }

      if (!ledger_id && !party_id) {
        return res.status(400).json({ error: 'At least one of ledger_id or party_id is required' });
      }

      // Get data from service
      const { entries, opening_balance } = await this.ledgerReportService.getLedgerReport(
        companyId,
        from_date,
        to_date,
        { ledgerId: ledger_id, partyId: party_id }
      );

      // Compute running balance
      let runningBalance = opening_balance.debit - opening_balance.credit;
      
      const transactions = entries.map(entry => {
        const debit = parseFloat(entry.debit_amount || 0);
        const credit = parseFloat(entry.credit_amount || 0);
        runningBalance += debit - credit;

        return {
          voucher_date: entry.voucher_date,
          voucher_no: entry.voucher_no,
          ledger_name: entry.ledger_name,
          debit,
          credit,
          running_balance: runningBalance
        };
      });

      const closingBalance = runningBalance;

      res.json({
        opening_balance: opening_balance.debit - opening_balance.credit,
        transactions,
        closing_balance: closingBalance
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = LedgerReportController;