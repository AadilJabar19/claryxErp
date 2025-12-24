exports.seed = function(knex) {
  return knex('ledgers').del()
    .then(function () {
      return knex('ledgers').insert([
        {
          id: 1,
          company_id: 1,
          account_id: 1,
          ledger_code: 'SALES001',
          ledger_name: 'Sales Ledger',
          opening_balance: 0,
          balance_type: 'CREDIT',
          is_active: true
        },
        {
          id: 2,
          company_id: 1,
          account_id: 2,
          ledger_code: 'PURCH001',
          ledger_name: 'Purchase Ledger',
          opening_balance: 0,
          balance_type: 'DEBIT',
          is_active: true
        },
        {
          id: 3,
          company_id: 1,
          account_id: 3,
          ledger_code: 'CASH001',
          ledger_name: 'Cash in Hand',
          opening_balance: 10000,
          balance_type: 'DEBIT',
          is_active: true
        },
        {
          id: 4,
          company_id: 1,
          account_id: 4,
          ledger_code: 'BANK001',
          ledger_name: 'Bank Account - SBI',
          opening_balance: 50000,
          balance_type: 'DEBIT',
          is_active: true
        }
      ]);
    });
};