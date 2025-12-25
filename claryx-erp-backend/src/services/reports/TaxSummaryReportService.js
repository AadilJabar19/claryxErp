const db = require('../../config/database');

class TaxSummaryReportService {
  static async getTaxSummary(companyId, fromDate, toDate) {
    const baseQuery = `
      SELECT 
        vi.tax_rate,
        vi.tax_type,
        SUM(vi.taxable_amount) as taxable_amount,
        SUM(vi.tax_amount) as tax_amount,
        COUNT(*) as transaction_count
      FROM vouchers v
      JOIN voucher_items vi ON v.id = vi.voucher_id
      WHERE v.company_id = ?
        AND v.is_posted = true
        AND v.is_reversed = false
        AND v.voucher_date BETWEEN ? AND ?
        AND v.voucher_type = ?
      GROUP BY vi.tax_rate, vi.tax_type
      ORDER BY vi.tax_rate, vi.tax_type
    `;

    const [outwardSupplies] = await db.execute(baseQuery, [
      companyId, fromDate, toDate, 'SALES'
    ]);

    const [inwardSupplies] = await db.execute(baseQuery, [
      companyId, fromDate, toDate, 'PURCHASE'
    ]);

    return {
      outward_supplies: outwardSupplies,
      inward_supplies: inwardSupplies,
      summary: {
        total_outward_taxable: outwardSupplies.reduce((sum, item) => sum + parseFloat(item.taxable_amount || 0), 0),
        total_outward_tax: outwardSupplies.reduce((sum, item) => sum + parseFloat(item.tax_amount || 0), 0),
        total_inward_taxable: inwardSupplies.reduce((sum, item) => sum + parseFloat(item.taxable_amount || 0), 0),
        total_inward_tax: inwardSupplies.reduce((sum, item) => sum + parseFloat(item.tax_amount || 0), 0)
      }
    };
  }
}

module.exports = TaxSummaryReportService;