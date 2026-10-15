import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const NOW = `(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`

const SCHEMA = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'vendor', 'admin')),
  created_at    TEXT    NOT NULL DEFAULT ${NOW}
);

-- id is the SHA-256 of the cookie token, so a leaked database cannot be used to hijack sessions.
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT    NOT NULL DEFAULT ${NOW},
  expires_at TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS consents (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy         TEXT    NOT NULL,
  policy_version TEXT    NOT NULL,
  context        TEXT    NOT NULL,
  ip_address     TEXT,
  user_agent     TEXT,
  accepted_at    TEXT    NOT NULL DEFAULT ${NOW}
);

CREATE INDEX IF NOT EXISTS idx_consents_user ON consents(user_id);
`

function openDatabase(): DatabaseSync {
  const file = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'mrittika.db')
  mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(SCHEMA)
  return db
}

// Cached on globalThis so dev-mode hot reloads reuse one connection instead of opening a new one per edit.
const globalForDb = globalThis as unknown as { mrittikaDb?: DatabaseSync }

export function getDb(): DatabaseSync {
  globalForDb.mrittikaDb ??= openDatabase()
  return globalForDb.mrittikaDb
}

export function transaction<T>(work: (db: DatabaseSync) => T): T {
  const db = getDb()
  db.exec('BEGIN')
  try {
    const result = work(db)
    db.exec('COMMIT')
    return result
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}
