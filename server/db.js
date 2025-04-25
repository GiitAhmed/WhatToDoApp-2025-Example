const { Pool } = require('pg');

// Create a new pool with PostgreSQL connection details
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'whattodoapp',
  password: 'senshe',
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 