exports.seed = function(knex) {
  return knex('financial_years').del()
    .then(function () {
      return knex('financial_years').insert([
        {
          id: 1,
          company_id: 1,
          year_code: 'FY2024',
          start_date: '2024-04-01',
          end_date: '2025-03-31',
          is_locked: false,
          is_active: true
        }
      ]);
    });
};