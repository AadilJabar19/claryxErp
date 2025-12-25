exports.up = function(knex) {
  return Promise.all([
    // Index on vouchers for company and date filtering
    knex.raw('CREATE INDEX IF NOT EXISTS idx_vouchers_company_date ON vouchers (company_id, voucher_date)'),
    
    // Index on vouchers for status filtering
    knex.raw('CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers (is_posted, is_reversed)'),
    
    // Index on voucher_lines for joins
    knex.raw('CREATE INDEX IF NOT EXISTS idx_voucher_lines_ledger_voucher ON voucher_lines (ledger_id, voucher_id)'),
    
    // Index on stock_movements for item and date filtering
    knex.raw('CREATE INDEX IF NOT EXISTS idx_stock_movements_item_date ON stock_movements (item_id, movement_date)')
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.raw('DROP INDEX IF EXISTS idx_vouchers_company_date'),
    knex.raw('DROP INDEX IF EXISTS idx_vouchers_status'),
    knex.raw('DROP INDEX IF EXISTS idx_voucher_lines_ledger_voucher'),
    knex.raw('DROP INDEX IF EXISTS idx_stock_movements_item_date')
  ]);
};