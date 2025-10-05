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
    quantity INTEGER NOT NULL,
    components JSONB NOT NULL,
    work_order JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS manufacturing_orders (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('planned', 'in_progress', 'done', 'canceled')),
    deadline TIMESTAMP NOT NULL,
    bom_id INTEGER REFERENCES boms(id),
    work_center_id INTEGER NOT NULL REFERENCES work_centers(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    components JSONB NOT NULL,
    work_orders JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    mo_id INTEGER NOT NULL REFERENCES manufacturing_orders(id),
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'started', 'paused', 'completed')),
    step_name VARCHAR(255) NOT NULL,
    estimated_time INTEGER NOT NULL,
    inherited_from_bom BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`);

export const db = drizzle(pool);
