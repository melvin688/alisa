import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'coffee.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_zh TEXT NOT NULL,
      description TEXT NOT NULL,
      description_zh TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      tags_zh TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '[]',
      notes_zh TEXT NOT NULL DEFAULT '[]',
      category TEXT NOT NULL CHECK(category IN ('beans', 'drink'))
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      name_zh TEXT NOT NULL,
      address TEXT NOT NULL,
      address_zh TEXT NOT NULL,
      hours TEXT NOT NULL,
      hours_zh TEXT NOT NULL,
      image TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_name TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      subscribed_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
