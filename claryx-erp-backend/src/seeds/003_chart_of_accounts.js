exports.seed = function(knex) {
  return knex('chart_of_accounts').del()
    .then(function () {
      return knex('chart_of_accounts').insert([
        {
          id: 1,
          company_id: 1,
          account_code: 'SALES',
          account_name: 'Sales Accounts',
          account_type: 'INCOME',
          account_subtype: 'REVENUE',
          is_group: false,
          is_active: true
        },
        {
          id: 2,
          company_id: 1,
          account_code: 'PURCHASE',
          account_name: 'Purchase Accounts',
          account_type: 'EXPENSE',
          account_subtype: 'DIRECT_EXPENSE',
          is_group: false,
          is_active: true
        },
        {
          id: 3,
          company_id: 1,
          account_code: 'CASH',
          account_name: 'Cash Accounts',
          account_type: 'ASSET',
          account_subtype: 'CURRENT_ASSET',
          is_group: false,
          is_active: true
        },
        {
          id: 4,
          company_id: 1,
          account_code: 'BANK',
          account_name: 'Bank Accounts',
          account_type: 'ASSET',
          account_subtype: 'CURRENT_ASSET',
          is_group: false,
          is_active: true
        }
      ]);
    });
};