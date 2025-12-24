exports.up = function(knex) {
  return knex.schema.createTable('audit_logs', function(table) {
    table.increments('id').primary();
    table.integer('company_id').notNullable();
    table.integer('user_id').notNullable();
    table.string('entity_type').notNullable();
    table.integer('entity_id').notNullable();
    table.string('action').notNullable();
    table.jsonb('metadata');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('audit_logs');
};