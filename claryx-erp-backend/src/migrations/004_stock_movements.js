exports.up = function(knex) {
  return knex.schema
    .createTable('stock_movements', function(table) {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.integer('company_id').unsigned().notNullable();
      table.integer('voucher_id').unsigned().notNullable();
      table.uuid('item_id').notNullable();
      table.decimal('quantity', 15, 4).notNullable();
      table.decimal('rate', 15, 2).notNullable();
      table.decimal('amount', 15, 2).notNullable();
      table.enu('movement_type', ['IN', 'OUT']).notNullable();
      table.date('movement_date').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      
      table.foreign('company_id').references('id').inTable('companies').onDelete('CASCADE');
      table.foreign('voucher_id').references('id').inTable('vouchers').onDelete('RESTRICT');
      table.index(['company_id', 'item_id']);
      table.index(['company_id', 'movement_date']);
      table.index(['voucher_id']);
      table.index(['item_id', 'movement_date']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('stock_movements');
};