exports.seed = function(knex) {
  return knex('voucher_types').del()
    .then(function () {
      return knex('voucher_types').insert([
        {
          id: 1,
          company_id: 1,
          voucher_code: 'SAL',
          voucher_name: 'Sales Voucher',
          voucher_category: 'SALES',
          prefix: 'SAL',
          next_number: 1,
          is_active: true
        },
        {
          id: 2,
          company_id: 1,
          voucher_code: 'PUR',
          voucher_name: 'Purchase Voucher',
          voucher_category: 'PURCHASE',
          prefix: 'PUR',
          next_number: 1,
          is_active: true
        },
        {
          id: 3,
          company_id: 1,
          voucher_code: 'RCP',
          voucher_name: 'Receipt Voucher',
          voucher_category: 'RECEIPT',
          prefix: 'RCP',
          next_number: 1,
          is_active: true
        }
      ]);
    });
};