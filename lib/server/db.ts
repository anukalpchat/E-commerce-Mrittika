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

CREATE TABLE IF NOT EXISTS addresses (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT    NOT NULL,
  phone      TEXT    NOT NULL,
  line1      TEXT    NOT NULL,
  line2      TEXT    NOT NULL DEFAULT '',
  city       TEXT    NOT NULL,
  state      TEXT    NOT NULL,
  pincode    TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT ${NOW}
);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- Amounts are whole rupees, GST-inclusive, matching the catalogue. The shipping address is copied
-- onto the order so later edits to the address book do not rewrite order history.
CREATE TABLE IF NOT EXISTS orders (
  id             TEXT    PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  status         TEXT    NOT NULL CHECK (status IN ('pending_payment', 'paid', 'payment_failed', 'cancelled', 'shipped', 'delivered')),
  subtotal       INTEGER NOT NULL,
  shipping       INTEGER NOT NULL,
  total          INTEGER NOT NULL,
  payment_method TEXT,
  ship_name      TEXT    NOT NULL,
  ship_phone     TEXT    NOT NULL,
  ship_line1     TEXT    NOT NULL,
  ship_line2     TEXT    NOT NULL DEFAULT '',
  ship_city      TEXT    NOT NULL,
  ship_state     TEXT    NOT NULL,
  ship_pincode   TEXT    NOT NULL,
  created_at     TEXT    NOT NULL DEFAULT ${NOW},
  paid_at        TEXT
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);

-- Product details are snapshotted so invoices stay correct if the catalogue changes later.
CREATE TABLE IF NOT EXISTS order_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id          TEXT    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_slug      TEXT    NOT NULL,
  product_name      TEXT    NOT NULL,
  vendor            TEXT    NOT NULL,
  vendor_location   TEXT    NOT NULL,
  country_of_origin TEXT    NOT NULL,
  category          TEXT    NOT NULL,
  unit_price        INTEGER NOT NULL,
  gst_rate          REAL    NOT NULL,
  quantity          INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS order_events (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   TEXT    NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status     TEXT    NOT NULL,
  note       TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT ${NOW}
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT    NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT ${NOW},
  PRIMARY KEY (user_id, product_slug)
);
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
