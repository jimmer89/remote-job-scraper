import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = process.env.USERS_DB_PATH || path.join(process.cwd(), 'data', 'users.db');
  db = new Database(dbPath);

  // Enable WAL mode for better concurrent reads
  db.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      is_pro INTEGER DEFAULT 0,
      stripe_customer_id TEXT,
      pro_expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  return db;
}
