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
      table.index(['company_id']);
      table.index(['is_active']);
      table.index(['is_locked']);
    })
    .createTable('voucher_types', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.string('voucher_code').notNullable();
      table.string('voucher_name').notNullable();
      table.enum('voucher_category', ['SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL', 'CONTRA']).notNullable();
      table.string('prefix');
      table.integer('next_number').defaultTo(1);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.unique(['company_id', 'voucher_code']);
      table.index(['company_id']);
      table.index(['voucher_category']);
      table.index(['is_active']);
    })
    .createTable('chart_of_accounts', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.string('account_code').notNullable();
      table.string('account_name').notNullable();
      table.enum('account_type', ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE']).notNullable();
      table.enum('account_subtype', ['CURRENT_ASSET', 'FIXED_ASSET', 'CURRENT_LIABILITY', 'LONG_TERM_LIABILITY', 'CAPITAL', 'REVENUE', 'DIRECT_EXPENSE', 'INDIRECT_EXPENSE']).notNullable();
      table.integer('parent_id').unsigned();
      table.boolean('is_group').defaultTo(false);
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.foreign('parent_id').references('id').inTable('chart_of_accounts').onDelete('SET NULL');
      table.unique(['company_id', 'account_code']);
      table.index(['company_id']);
      table.index(['account_type']);
      table.index(['parent_id']);
      table.index(['is_active']);
    })
    .createTable('ledgers', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.integer('account_id').unsigned().notNullable();
      table.string('ledger_code').notNullable();
      table.string('ledger_name').notNullable();
      table.decimal('opening_balance', 15, 2).defaultTo(0);
      table.enum('balance_type', ['DEBIT', 'CREDIT']).defaultTo('DEBIT');
      table.text('address');
      table.string('contact_person');
      table.string('phone');
      table.string('email');
      table.string('gstin');
      table.boolean('is_active').defaultTo(true);
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.foreign('account_id').references('id').inTable('chart_of_accounts').onDelete('RESTRICT');
      table.unique(['company_id', 'ledger_code']);
      table.index(['company_id']);
      table.index(['account_id']);
      table.index(['is_active']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('ledgers')
    .dropTableIfExists('chart_of_accounts')
    .dropTableIfExists('voucher_types')
    .dropTableIfExists('financial_years');
};