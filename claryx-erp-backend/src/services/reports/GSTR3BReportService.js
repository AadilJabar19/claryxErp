const db = require('../../config/database');

class GSTR3BReportService {
  static async getGSTR3BReport(companyId, fromDate, toDate) {
    const baseQuery = `
      SELECT 
        SUM(vi.taxable_amount) as taxable_value,
        SUM(CASE WHEN vi.tax_type = 'IGST' THEN vi.tax_amount ELSE 0 END) as igst,
        SUM(CASE WHEN vi.tax_type = 'CGST' THEN vi.tax_amount ELSE 0 END) as cgst,
        SUM(CASE WHEN vi.tax_type = 'SGST' THEN vi.tax_amount ELSE 0 END) as sgst
      FROM vouchers v
      JOIN voucher_items vi ON v.id = vi.voucher_id
      WHERE v.company_id = ?
        AND v.is_posted = true
        AND v.is_reversed = false
        AND v.voucher_date BETWEEN ? AND ?
        AND v.voucher_type = ?
    `;

    const [outwardResults] = await db.execute(baseQuery, [
      companyId, fromDate, toDate, 'SALES'
    ]);

    const [inwardResults] = await db.execute(baseQuery, [
      companyId, fromDate, toDate, 'PURCHASE'
    ]);

    const outward = outwardResults[0] || {};
    const inward = inwardResults[0] || {};

    return {
      section_3_1: {
        outward_taxable_value: parseFloat(outward.taxable_value || 0),
        outward_igst: parseFloat(outward.igst || 0),
        outward_cgst: parseFloat(outward.cgst || 0),
        outward_sgst: parseFloat(outward.sgst || 0)
      },
      section_4: {
        inward_taxable_value: parseFloat(inward.taxable_value || 0),
        inward_igst: parseFloat(inward.igst || 0),
        inward_cgst: parseFloat(inward.cgst || 0),
        inward_sgst: parseFloat(inward.sgst || 0)
      }
    };
  }
}

module.exports = GSTR3BReportService;