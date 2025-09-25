import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL,
    reset_otp VARCHAR(10),
    reset_otp_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS stock_ledger (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(255) NOT NULL,
    material_type VARCHAR(20) NOT NULL CHECK (material_type IN ('finished_goods','raw_materials')),
    quantity INTEGER NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'piece',
    unit_cost INTEGER NOT NULL,
    total_value INTEGER GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    date TIMESTAMP NOT NULL DEFAULT NOW(), -- Re-added
    work_order_id INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS work_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    capacity INTEGER NOT NULL,
    cost_per_hour INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS boms (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    components JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

export const db = drizzle(pool);
