exports.up = function(knex) {
  return knex.schema
    .createTable('companies', function(table) {
      table.increments('id').primary();
      table.string('company_code').unique().notNullable();
      table.string('company_name').notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.index(['company_code']);
      table.index(['is_active']);
    })
    .createTable('users', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.string('email').notNullable();
      table.string('password_hash').notNullable();
      table.jsonb('roles').defaultTo('[]');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.unique(['company_id', 'email']);
      table.index(['company_id']);
      table.index(['email']);
      table.index(['is_active']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users')
    .dropTableIfExists('companies');
};