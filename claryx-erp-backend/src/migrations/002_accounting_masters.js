exports.up = function(knex) {
  return knex.schema
    .createTable('financial_years', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.string('year_code').notNullable();
      table.date('start_date').notNullable();
      table.date('end_date').notNullable();
      table.boolean('is_locked').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.unique(['company_id', 'year_code']);
      table.index(['company_id', 'is_active']);
    })
    .createTable('voucher_types', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.string('type_code').notNullable();
      table.string('type_name').notNullable();
      table.enu('category', ['SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL']).notNullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.unique(['company_id', 'type_code']);
      table.index(['company_id', 'category']);
    })
    .createTable('chart_of_accounts', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.string('account_code').notNullable();
      table.string('account_name').notNullable();
      table.enu('account_type', ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']).notNullable();
      table.integer('parent_id').unsigned().nullable();
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.foreign('parent_id').references('id').inTable('chart_of_accounts').onDelete('SET NULL');
      table.unique(['company_id', 'account_code']);
      table.index(['company_id', 'account_type']);
    })
    .createTable('ledgers', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.string('ledger_code').notNullable();
      table.string('ledger_name').notNullable();
      table.integer('account_id').unsigned().notNullable();
      table.decimal('opening_balance', 15, 2).defaultTo(0);
      table.enu('balance_type', ['DEBIT', 'CREDIT']).defaultTo('DEBIT');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.foreign('account_id').references('id').inTable('chart_of_accounts').onDelete('RESTRICT');
      table.unique(['company_id', 'ledger_code']);
      table.index(['company_id', 'account_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ledgers')
    .dropTableIfExists('chart_of_accounts')
    .dropTableIfExists('voucher_types')
    .dropTableIfExists('financial_years');
};