import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      items      JSONB NOT NULL DEFAULT '[]',
      svg_snapshot TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Database schema is ready');
}

export default pool;
