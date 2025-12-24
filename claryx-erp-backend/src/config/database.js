const knex = require('knex');
const config = require('./env');

const knexConfig = {
  client: 'pg',
  connection: {
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME
  },
  pool: {
    min: 2,
    max: 10
  }
};

const db = knex(knexConfig);

module.exports = db;