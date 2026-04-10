import pg from "pg";

const { Pool } = pg;

export async function initDb(): Promise<void> {
  if (!process.env.DATABASE_URL) return;

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        google_id TEXT,
        avatar_url TEXT,
        plan TEXT NOT NULL DEFAULT 'free',
        is_admin BOOLEAN NOT NULL DEFAULT false,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        email_verify_token TEXT,
        email_verify_expires TIMESTAMP,
        ip_address TEXT,
        device_fingerprint TEXT,
        last_generation_at TIMESTAMP,
        free_generations_used INTEGER NOT NULL DEFAULT 0,
        free_generations_limit INTEGER NOT NULL DEFAULT 5,
        pro_generations_used INTEGER NOT NULL DEFAULT 0,
        pro_generations_limit INTEGER NOT NULL DEFAULT 200,
        credit_balance INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS generations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        prompt TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'traditional',
        style TEXT NOT NULL DEFAULT 'modern',
        slide_count INTEGER NOT NULL,
        slides JSONB NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        payer_name TEXT NOT NULL,
        type TEXT NOT NULL,
        amount_cents INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("[db] Tables initialized.");
  } finally {
    client.release();
    await pool.end();
  }
}
