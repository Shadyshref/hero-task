import { Pool } from "pg";

declare global {
  var heroTaskPool: Pool | undefined;
}

const pool =
  global.heroTaskPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.heroTaskPool = pool;
}

let schemaReady = false;

export async function ensureDatabase() {
  if (schemaReady) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      items JSONB NOT NULL DEFAULT '[]',
      svg_snapshot TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  schemaReady = true;
}

export default pool;
