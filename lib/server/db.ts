import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { seedDatabase } from './seed'

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

-- One row per seller. user_id is NULL for seed vendors that have no login.
CREATE TABLE IF NOT EXISTS vendors (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  business_name   TEXT    NOT NULL UNIQUE,
  city            TEXT    NOT NULL,
  state           TEXT    NOT NULL,
  gstin           TEXT,
  contact_email   TEXT    NOT NULL,
  contact_phone   TEXT    NOT NULL,
  categories      TEXT    NOT NULL,
  description     TEXT    NOT NULL,
  practices       TEXT    NOT NULL,
  status          TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  commission_rate REAL    NOT NULL DEFAULT 10,
  review_note     TEXT,
  created_at      TEXT    NOT NULL DEFAULT ${NOW},
  reviewed_at     TEXT
);

-- Vendor-submitted products start as pending_review; an admin sets the sustainability score when approving.
CREATE TABLE IF NOT EXISTS products (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                 TEXT    NOT NULL UNIQUE,
  vendor_id            INTEGER NOT NULL REFERENCES vendors(id),
  name                 TEXT    NOT NULL,
  category             TEXT    NOT NULL CHECK (category IN ('home-living', 'personal-care', 'fashion', 'food')),
  price                INTEGER NOT NULL CHECK (price > 0),
  gst_rate             REAL    NOT NULL,
  sustainability_score INTEGER CHECK (sustainability_score BETWEEN 0 AND 100),
  short_description    TEXT    NOT NULL,
  description          TEXT    NOT NULL,
  materials            TEXT    NOT NULL,
  certifications       TEXT    NOT NULL,
  tags                 TEXT    NOT NULL,
  stock_count          INTEGER NOT NULL CHECK (stock_count >= 0),
  image_url            TEXT    NOT NULL,
  image_color          TEXT    NOT NULL DEFAULT 'bg-stone-100',
  country_of_origin    TEXT    NOT NULL DEFAULT 'India',
  plastic_avoided_g    INTEGER NOT NULL DEFAULT 0,
  water_saved_l        INTEGER NOT NULL DEFAULT 0,
  waste_diverted_g     INTEGER NOT NULL DEFAULT 0,
  status               TEXT    NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'active', 'rejected', 'hidden')),
  review_note          TEXT,
  created_at           TEXT    NOT NULL DEFAULT ${NOW},
  updated_at           TEXT    NOT NULL DEFAULT ${NOW}
);

CREATE INDEX IF NOT EXISTS idx_products_vendor ON products(vendor_id);

-- Each vendor in an order ships its own items; the order is shipped/delivered once every vendor has.
-- Keyed by vendor name because order_items snapshots the vendor's business name, which never changes.
CREATE TABLE IF NOT EXISTS fulfilments (
  order_id   TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  vendor     TEXT NOT NULL,
  status     TEXT NOT NULL CHECK (status IN ('shipped', 'delivered')),
  updated_at TEXT NOT NULL DEFAULT ${NOW},
  PRIMARY KEY (order_id, vendor)
);

CREATE TABLE IF NOT EXISTS wishlist (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_slug TEXT    NOT NULL,
  created_at   TEXT    NOT NULL DEFAULT ${NOW},
  PRIMARY KEY (user_id, product_slug)
);
`

function databaseFile(): string {
  return process.env.DATABASE_PATH ?? path.join(process.cwd(), 'data', 'mrittika.db')
}

/** Folder for files that live next to the database, such as uploaded product photos. */
export function dataDir(...parts: string[]): string {
  return path.join(path.dirname(databaseFile()), ...parts)
}

function openDatabase(): DatabaseSync {
  const file = databaseFile()
  mkdirSync(path.dirname(file), { recursive: true })
  const db = new DatabaseSync(file)
  db.exec(SCHEMA)
  seedDatabase(db)
  return db
}

// Cached on globalThis so dev-mode hot reloads reuse one connection instead of opening a new one per edit.
// The schema text is cached too: when a reload brings new tables, they are created on the existing connection.
const globalForDb = globalThis as unknown as { mrittikaDb?: DatabaseSync; mrittikaSchema?: string }

export function getDb(): DatabaseSync {
  if (!globalForDb.mrittikaDb) {
    globalForDb.mrittikaDb = openDatabase()
  } else if (globalForDb.mrittikaSchema !== SCHEMA) {
    globalForDb.mrittikaDb.exec(SCHEMA)
    seedDatabase(globalForDb.mrittikaDb)
  }
  globalForDb.mrittikaSchema = SCHEMA
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
