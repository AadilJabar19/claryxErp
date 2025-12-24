const db = require('../config/database');
const AuditLogService = require('./AuditLogService');
const BaseService = require('./BaseService');

class ReceiptService extends BaseService {
  constructor() {
    super();
    this.auditLogService = new AuditLogService();
  }
  async createReceipt(receiptData, companyId, userId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { 
        party_id, 
        amount, 
        payment_method, 
        reference_number, 
        description,
        receipt_date = new Date()
      } = receiptData;

      // Check period lock
      await this.assertPeriodOpen(companyId, receipt_date, connection);

      // Create receipt voucher
      const [voucherResult] = await connection.execute(
        `INSERT INTO vouchers (company_id, voucher_type, voucher_number, voucher_date, 
         reference_number, description, total_amount, status, created_at) 
         VALUES (?, 'RECEIPT', ?, ?, ?, ?, ?, 'ACTIVE', NOW())`,
        [companyId, await this.generateVoucherNumber(connection, companyId), 
         receipt_date, reference_number, description, amount]
      );

      const voucherId = voucherResult.insertId;

      // Get cash/bank ledger based on payment method
      const cashLedgerId = await this.getCashLedgerId(connection, companyId, payment_method);
      
      // Debit Cash/Bank ledger
      await connection.execute(
        `INSERT INTO voucher_entries (voucher_id, ledger_id, debit_amount, credit_amount, description)
         VALUES (?, ?, ?, 0, ?)`,
        [voucherId, cashLedgerId, amount, `Receipt from party - ${description}`]
      );

      // Credit Party ledger
      await connection.execute(
        `INSERT INTO voucher_entries (voucher_id, ledger_id, debit_amount, credit_amount, description)
         VALUES (?, ?, 0, ?, ?)`,
        [voucherId, party_id, amount, `Payment received - ${description}`]
      );

      // Update ledger balances
      await this.updateLedgerBalance(connection, cashLedgerId, amount, 'DEBIT');
      await this.updateLedgerBalance(connection, party_id, amount, 'CREDIT');

      // Log audit
      await this.auditLogService.insertLog({
        companyId,
        userId,
        entityType: 'RECEIPT',
        entityId: voucherId,
        action: 'CREATE_RECEIPT',
        metadata: { amount, party_id }
      });

      await connection.commit();
      return { voucherId, message: 'Receipt created successfully' };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async reverseReceipt(originalVoucherId, companyId, reason, userId) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check period lock
      await this.assertPeriodOpen(companyId, new Date(), connection);

      // Get original voucher details
      const [originalVoucher] = await connection.execute(
        'SELECT * FROM vouchers WHERE id = ? AND company_id = ? AND status = "ACTIVE"',
        [originalVoucherId, companyId]
      );

      if (originalVoucher.length === 0) {
        throw new Error('Original receipt not found or already reversed');
      }

      // Get original entries
      const [originalEntries] = await connection.execute(
        'SELECT * FROM voucher_entries WHERE voucher_id = ?',
        [originalVoucherId]
      );

      // Create reversal voucher
      const [reversalResult] = await connection.execute(
        `INSERT INTO vouchers (company_id, voucher_type, voucher_number, voucher_date,
         reference_number, description, total_amount, status, created_at)
         VALUES (?, 'RECEIPT_REVERSAL', ?, NOW(), ?, ?, ?, 'ACTIVE', NOW())`,
        [companyId, await this.generateVoucherNumber(connection, companyId),
         `REV-${originalVoucher[0].voucher_number}`, reason, originalVoucher[0].total_amount]
      );

      const reversalVoucherId = reversalResult.insertId;

      // Create reverse entries
      for (const entry of originalEntries) {
        await connection.execute(
          `INSERT INTO voucher_entries (voucher_id, ledger_id, debit_amount, credit_amount, description)
           VALUES (?, ?, ?, ?, ?)`,
          [reversalVoucherId, entry.ledger_id, entry.credit_amount, entry.debit_amount, 
           `Reversal: ${entry.description}`]
        );

        // Update ledger balances (reverse the original effect)
        if (entry.debit_amount > 0) {
          await this.updateLedgerBalance(connection, entry.ledger_id, entry.debit_amount, 'CREDIT');
        }
        if (entry.credit_amount > 0) {
          await this.updateLedgerBalance(connection, entry.ledger_id, entry.credit_amount, 'DEBIT');
        }
      }

      // Mark original voucher as reversed
      await connection.execute(
        'UPDATE vouchers SET status = "REVERSED" WHERE id = ?',
        [originalVoucherId]
      );

      // Log audit
      await this.auditLogService.insertLog({
        companyId,
        userId,
        entityType: 'RECEIPT',
        entityId: originalVoucherId,
        action: 'REVERSE_RECEIPT',
        metadata: { reversalVoucherId }
      });

      await connection.commit();
      return { reversalVoucherId, message: 'Receipt reversed successfully' };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getReceipts(companyId, filters = {}) {
    const connection = await db.getConnection();
    
    try {
      let query = `
        SELECT v.*, l.name as party_name
        FROM vouchers v
        JOIN voucher_entries ve ON v.id = ve.voucher_id AND ve.credit_amount > 0
        JOIN ledgers l ON ve.ledger_id = l.id
        WHERE v.company_id = ? AND v.voucher_type IN ('RECEIPT', 'RECEIPT_REVERSAL')
      `;
      const params = [companyId];

      if (filters.party_id) {
        query += ' AND ve.ledger_id = ?';
        params.push(filters.party_id);
      }

      if (filters.date_from) {
        query += ' AND v.voucher_date >= ?';
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ' AND v.voucher_date <= ?';
        params.push(filters.date_to);
      }

      query += ' ORDER BY v.voucher_date DESC, v.id DESC';

      const [receipts] = await connection.execute(query, params);
      return receipts;

    } finally {
      connection.release();
    }
  }

  async getCashLedgerId(connection, companyId, paymentMethod) {
    const ledgerName = paymentMethod === 'BANK' ? 'Bank Account' : 'Cash';
    const [result] = await connection.execute(
      'SELECT id FROM ledgers WHERE company_id = ? AND name = ? AND ledger_type = "ASSET"',
      [companyId, ledgerName]
    );
    
    if (result.length === 0) {
      throw new Error(`${ledgerName} ledger not found`);
    }
    
    return result[0].id;
  }

  async updateLedgerBalance(connection, ledgerId, amount, type) {
    const operation = type === 'DEBIT' ? '+' : '-';
    await connection.execute(
      `UPDATE ledgers SET balance = balance ${operation} ? WHERE id = ?`,
      [amount, ledgerId]
    );
  }

  async generateVoucherNumber(connection, companyId) {
    const [result] = await connection.execute(
      'SELECT COUNT(*) as count FROM vouchers WHERE company_id = ? AND voucher_type LIKE "RECEIPT%"',
      [companyId]
    );
    return `RCP${String(result[0].count + 1).padStart(6, '0')}`;
  }
}

module.exports = new ReceiptService();