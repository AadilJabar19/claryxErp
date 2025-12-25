const db = require('../../config/database');

class HSNReportService {
  static async getHSNReport(companyId, fromDate, toDate) {
    const query = `
      SELECT 
        i.hsn_code,
        i.unit,
        vi.tax_rate,
        SUM(vi.quantity) as total_quantity,
        SUM(vi.taxable_amount) as taxable_value,
        SUM(CASE WHEN vi.tax_type = 'IGST' THEN vi.tax_amount ELSE 0 END) as igst,
        SUM(CASE WHEN vi.tax_type = 'CGST' THEN vi.tax_amount ELSE 0 END) as cgst,
        SUM(CASE WHEN vi.tax_type = 'SGST' THEN vi.tax_amount ELSE 0 END) as sgst,
        SUM(vi.taxable_amount + vi.tax_amount) as total_value
      FROM vouchers v
      JOIN voucher_items vi ON v.id = vi.voucher_id
      JOIN items i ON vi.item_id = i.id
      WHERE v.company_id = ?
        AND v.is_posted = true
        AND v.is_reversed = false
        AND v.voucher_date BETWEEN ? AND ?
      GROUP BY i.hsn_code, i.unit, vi.tax_rate
      ORDER BY i.hsn_code, vi.tax_rate
    `;

    const [results] = await db.execute(query, [companyId, fromDate, toDate]);

    return {
      hsn_data: results.map(row => ({
        hsn_sc: row.hsn_code,
        uqc: row.unit,
        rt: parseFloat(row.tax_rate),
        qty: parseFloat(row.total_quantity || 0),
        val: parseFloat(row.taxable_value || 0),
        iamt: parseFloat(row.igst || 0),
        camt: parseFloat(row.cgst || 0),
        samt: parseFloat(row.sgst || 0),
        txval: parseFloat(row.total_value || 0)
      }))
    };
  }
}

module.exports = HSNReportService;