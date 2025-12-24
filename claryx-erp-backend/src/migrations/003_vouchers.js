exports.up = function(knex) {
  return knex.schema
    .createTable('vouchers', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.integer('financial_year_id').unsigned().notNullable();
      table.integer('voucher_type_id').unsigned().notNullable();
      table.string('voucher_number').notNullable();
      table.date('voucher_date').notNullable();
      table.string('reference_number');
      table.text('narration');
      table.decimal('total_amount', 15, 2).notNullable();
      table.integer('reversed_voucher_id').unsigned();
      table.boolean('is_posted').defaultTo(false);
      table.boolean('is_reversed').defaultTo(false);
      table.integer('created_by').unsigned().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.foreign('financial_year_id').references('id').inTable('financial_years').onDelete('RESTRICT');
      table.foreign('voucher_type_id').references('id').inTable('voucher_types').onDelete('RESTRICT');
      table.foreign('reversed_voucher_id').references('id').inTable('vouchers').onDelete('SET NULL');
      table.foreign('created_by').references('id').inTable('users').onDelete('RESTRICT');
      table.unique(['company_id', 'voucher_type_id', 'voucher_number']);
      table.index(['company_id', 'voucher_date']);
      table.index(['company_id', 'is_posted']);
      table.index(['financial_year_id']);
      table.index(['voucher_type_id']);
      table.index(['is_reversed']);
    })
    .createTable('voucher_lines', function(table) {
      table.increments('id').primary();
      table.integer('company_id').unsigned().notNullable();
      table.integer('voucher_id').unsigned().notNullable();
      table.integer('ledger_id').unsigned().notNullable();
      table.decimal('debit_amount', 15, 2).defaultTo(0);
      table.decimal('credit_amount', 15, 2).defaultTo(0);
      table.text('line_narration');
      table.integer('line_number').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.foreign('voucher_id').references('id').inTable('vouchers').onDelete('CASCADE');
      table.foreign('ledger_id').references('id').inTable('ledgers').onDelete('RESTRICT');
      table.index(['company_id', 'voucher_id']);
      table.index(['company_id', 'ledger_id']);
      table.index(['voucher_id', 'line_number']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('voucher_lines')
    .dropTableIfExists('vouchers');
};