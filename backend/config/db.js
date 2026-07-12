const { Pool } = require('pg');

// Works with a plain PostgreSQL instance OR Supabase's connection string.
// Set DATABASE_URL in your .env, e.g.:
// postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
});

pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
