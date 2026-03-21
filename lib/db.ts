import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "dealwise.db");

// Ensure data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent access
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    image TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS credits (
    email TEXT PRIMARY KEY,
    credits INTEGER DEFAULT 50,
    total_used INTEGER DEFAULT 0,
    plan TEXT DEFAULT 'free' CHECK(plan IN ('free', 'pro', 'admin')),
    created_at TEXT DEFAULT (datetime('now')),
    last_used_at TEXT
  );

  CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    contract_snippet TEXT,
    overall_score INTEGER,
    recommendation TEXT,
    nominal_rate REAL,
    effective_rate REAL,
    rate_reduction REAL,
    currency TEXT DEFAULT 'USD',
    contract_type TEXT,
    full_result TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_email) REFERENCES users(email)
  );

  CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contract_versions (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    contract_name TEXT,
    version_number INTEGER DEFAULT 1,
    analysis_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_email) REFERENCES users(email),
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
  );
`);

export default db;
