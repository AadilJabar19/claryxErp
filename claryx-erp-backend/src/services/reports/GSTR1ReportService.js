const db = require('../../config/database');

class GSTR1ReportService {
  static async getGSTR1Report(companyId, fromDate, toDate) {
    const baseQuery = `
      SELECT 
        v.voucher_no as invoice_no,
        v.voucher_date as invoice_date,
        p.name as party_name,
        p.gstin as party_gstin,
        vi.taxable_amount as taxable_value,
        vi.tax_rate,
        CASE WHEN vi.tax_type = 'IGST' THEN vi.tax_amount ELSE 0 END as igst,
        CASE WHEN vi.tax_type = 'CGST' THEN vi.tax_amount ELSE 0 END as cgst,
        CASE WHEN vi.tax_type = 'SGST' THEN vi.tax_amount ELSE 0 END as sgst,
        (vi.taxable_amount + vi.tax_amount) as total_value
      FROM vouchers v
      JOIN voucher_items vi ON v.id = vi.voucher_id
      JOIN parties p ON v.party_id = p.id
      WHERE v.company_id = ?
        AND v.is_posted = true
        AND v.is_reversed = false
        AND v.voucher_type = 'SALES'
        AND v.voucher_date BETWEEN ? AND ?
      ORDER BY v.voucher_date, v.voucher_no
    `;

    const [results] = await db.execute(baseQuery, [companyId, fromDate, toDate]);

    // Group by invoice and aggregate tax amounts
    const invoiceMap = new Map();
    
    results.forEach(row => {
      const key = `${row.invoice_no}_${row.invoice_date}`;
      
      if (!invoiceMap.has(key)) {
        invoiceMap.set(key, {
          invoice_no: row.invoice_no,
          invoice_date: row.invoice_date,
          party_name: row.party_name,
          party_gstin: row.party_gstin,
          taxable_value: 0,
          tax_rate: row.tax_rate,
          igst: 0,
          cgst: 0,
          sgst: 0,
          total_value: 0
        });
      }
      
      const invoice = invoiceMap.get(key);
      invoice.taxable_value += parseFloat(row.taxable_value || 0);
      invoice.igst += parseFloat(row.igst || 0);
      invoice.cgst += parseFloat(row.cgst || 0);
      invoice.sgst += parseFloat(row.sgst || 0);
      invoice.total_value += parseFloat(row.total_value || 0);
    });

    const invoices = Array.from(invoiceMap.values());

    // Split into B2B and B2C
    const b2b = invoices.filter(inv => inv.party_gstin && inv.party_gstin.trim() !== '');
    const b2c = invoices.filter(inv => !inv.party_gstin || inv.party_gstin.trim() === '');

    return {
      b2b: b2b.map(inv => ({
        invoice_no: inv.invoice_no,
        invoice_date: inv.invoice_date,
        party_name: inv.party_name,
        party_gstin: inv.party_gstin,
        taxable_value: parseFloat(inv.taxable_value.toFixed(2)),
        tax_rate: inv.tax_rate,
        igst: parseFloat(inv.igst.toFixed(2)),
        cgst: parseFloat(inv.cgst.toFixed(2)),
        sgst: parseFloat(inv.sgst.toFixed(2)),
        total_value: parseFloat(inv.total_value.toFixed(2))
      })),
      b2c: b2c.map(inv => ({
        invoice_no: inv.invoice_no,
        invoice_date: inv.invoice_date,
        party_name: inv.party_name,
        party_gstin: null,
        taxable_value: parseFloat(inv.taxable_value.toFixed(2)),
        tax_rate: inv.tax_rate,
        igst: parseFloat(inv.igst.toFixed(2)),
        cgst: parseFloat(inv.cgst.toFixed(2)),
        sgst: parseFloat(inv.sgst.toFixed(2)),
        total_value: parseFloat(inv.total_value.toFixed(2))
      }))
    };
  }
}

module.exports = GSTR1ReportService;