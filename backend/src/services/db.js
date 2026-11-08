const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

pool.on('error', (err) => console.error('Postgres pool error:', err.message));

const query = (text, params) => pool.query(text, params);

/** Gaya is single-user for now: the first profile row is "the" profile, created on demand. */
async function ensureProfileId() {
  const existing = await query('SELECT id FROM profiles ORDER BY created_at LIMIT 1');
  if (existing.rows[0]) return existing.rows[0].id;
  const created = await query('INSERT INTO profiles DEFAULT VALUES RETURNING id');
  return created.rows[0].id;
}

module.exports = { pool, query, ensureProfileId };
