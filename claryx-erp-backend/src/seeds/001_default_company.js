exports.seed = function(knex) {
  return knex('companies').del()
    .then(function () {
      return knex('companies').insert([
        {
          id: 1,
          company_code: 'DEMO',
          company_name: 'Demo Company Ltd.',
          is_active: true
        }
      ]);
    });
};