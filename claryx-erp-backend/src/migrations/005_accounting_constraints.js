exports.up = function(knex) {
  return knex.schema
    .alterTable('voucher_lines', function(table) {
      // CHECK constraints for non-negative amounts
      table.check('debit_amount >= 0', [], 'chk_voucher_lines_debit_non_negative');
      table.check('credit_amount >= 0', [], 'chk_voucher_lines_credit_non_negative');
      // Ensure voucher_lines cannot have BOTH debit_amount > 0 AND credit_amount > 0
      table.check('NOT (debit_amount > 0 AND credit_amount > 0)', [], 'chk_voucher_lines_not_both_amounts');
    })
    .alterTable('stock_movements', function(table) {
      // CHECK constraint for positive quantity
      table.check('quantity > 0', [], 'chk_stock_movements_quantity_positive');
    })

    .raw(`
      -- Update existing foreign key constraints to ON DELETE RESTRICT for accounting tables
      ALTER TABLE voucher_lines DROP CONSTRAINT voucher_lines_ledger_id_foreign;
      ALTER TABLE voucher_lines ADD CONSTRAINT voucher_lines_ledger_id_foreign 
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE RESTRICT;
      
      ALTER TABLE vouchers DROP CONSTRAINT vouchers_financial_year_id_foreign;
      ALTER TABLE vouchers ADD CONSTRAINT vouchers_financial_year_id_foreign 
        FOREIGN KEY (financial_year_id) REFERENCES financial_years(id) ON DELETE RESTRICT;
      
      ALTER TABLE vouchers DROP CONSTRAINT vouchers_voucher_type_id_foreign;
      ALTER TABLE vouchers ADD CONSTRAINT vouchers_voucher_type_id_foreign 
        FOREIGN KEY (voucher_type_id) REFERENCES voucher_types(id) ON DELETE RESTRICT;
      
      ALTER TABLE vouchers DROP CONSTRAINT vouchers_created_by_foreign;
      ALTER TABLE vouchers ADD CONSTRAINT vouchers_created_by_foreign 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
      
      ALTER TABLE ledgers DROP CONSTRAINT ledgers_account_id_foreign;
      ALTER TABLE ledgers ADD CONSTRAINT ledgers_account_id_foreign 
        FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT;
    `);
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('voucher_lines', function(table) {
      table.dropChecks(['chk_voucher_lines_debit_non_negative', 'chk_voucher_lines_credit_non_negative', 'chk_voucher_lines_not_both_amounts']);
    })
    .alterTable('stock_movements', function(table) {
      table.dropChecks(['chk_stock_movements_quantity_positive']);
    })

    .raw(`
      -- Revert foreign key constraints back to original behavior
      ALTER TABLE voucher_lines DROP CONSTRAINT voucher_lines_ledger_id_foreign;
      ALTER TABLE voucher_lines ADD CONSTRAINT voucher_lines_ledger_id_foreign 
        FOREIGN KEY (ledger_id) REFERENCES ledgers(id) ON DELETE RESTRICT;
      
      ALTER TABLE vouchers DROP CONSTRAINT vouchers_financial_year_id_foreign;
      ALTER TABLE vouchers ADD CONSTRAINT vouchers_financial_year_id_foreign 
        FOREIGN KEY (financial_year_id) REFERENCES financial_years(id) ON DELETE RESTRICT;
      
      ALTER TABLE vouchers DROP CONSTRAINT vouchers_voucher_type_id_foreign;
      ALTER TABLE vouchers ADD CONSTRAINT vouchers_voucher_type_id_foreign 
        FOREIGN KEY (voucher_type_id) REFERENCES voucher_types(id) ON DELETE RESTRICT;
      
      ALTER TABLE vouchers DROP CONSTRAINT vouchers_created_by_foreign;
      ALTER TABLE vouchers ADD CONSTRAINT vouchers_created_by_foreign 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
      
      ALTER TABLE ledgers DROP CONSTRAINT ledgers_account_id_foreign;
      ALTER TABLE ledgers ADD CONSTRAINT ledgers_account_id_foreign 
        FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT;
    `);
};