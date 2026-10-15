import type { DatabaseSync } from 'node:sqlite'
import { products as seedProducts } from '@/lib/products'
import { COUNTRY_OF_ORIGIN, getProductImpact } from '@/lib/product-impact'
import { hashPasswordSync } from './password'

/**
 * Demo mode: seeded demo logins and the one-click account switcher. On by default outside production,
 * so a real deployment never ships known passwords or a login shortcut unless explicitly enabled.
 */
export const DEMO_MODE = process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_ACCOUNTS === 'true'

export const DEMO_ACCOUNTS = {
  buyer: { email: 'buyer@mrittika.test', password: 'DemoBuyer@2026', name: 'Priya Nair' },
  admin: { email: 'admin@mrittika.test', password: 'MrittikaAdmin@2026', name: 'Mrittika Admin' },
  vendor: { email: 'vendor@mrittika.test', password: 'AranyaVendor@2026', name: 'Lakshmi Iyer', business: 'Aranya Botanicals' },
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

/**
 * Inserts any seed vendor or product that is missing, matched by business name and slug.
 * Existing rows are never touched, so admin and vendor edits survive, and products added to
 * lib/products.ts later still reach databases created before them.
 */
function seedCatalogue(db: DatabaseSync): void {
  const existingSlugs = new Set(db.prepare(`SELECT slug FROM products`).all().map(r => String(r.slug)))
  const missing = seedProducts.filter(p => !existingSlugs.has(p.slug))
  if (missing.length === 0) return

  const insertVendor = db.prepare(
    `INSERT INTO vendors (business_name, city, state, contact_email, contact_phone, categories, description, practices, status, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
     RETURNING id`,
  )
  const insertProduct = db.prepare(
    `INSERT INTO products (slug, vendor_id, name, category, price, gst_rate, sustainability_score, short_description, description,
       materials, certifications, tags, stock_count, image_url, image_color, country_of_origin,
       plastic_avoided_g, water_saved_l, waste_diverted_g, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
  )

  const vendorIds = new Map<string, number>(
    db.prepare(`SELECT id, business_name FROM vendors`).all().map(r => [String(r.business_name), Number(r.id)]),
  )
  db.exec('BEGIN')
  try {
    for (const p of missing) {
      let vendorId = vendorIds.get(p.vendor)
      if (vendorId === undefined) {
        const [city, state] = p.vendorLocation.split(',').map(s => s.trim())
        const vendorProducts = seedProducts.filter(sp => sp.vendor === p.vendor)
        const categories = Array.from(new Set(vendorProducts.map(sp => sp.category)))
        const certifications = Array.from(new Set(vendorProducts.flatMap(sp => sp.certifications)))
        const row = insertVendor.get(
          p.vendor, city, state ?? city,
          `hello@${slugify(p.vendor)}.example`, '9000000000',
          JSON.stringify(categories),
          `${p.vendor} is a producer based in ${p.vendorLocation}, part of Mrittika's founding catalogue.`,
          `Holds: ${certifications.join(', ')}.`,
        )
        vendorId = Number(row?.id)
        vendorIds.set(p.vendor, vendorId)
      }
      const impact = getProductImpact(p.slug)
      insertProduct.run(
        p.slug, vendorId, p.name, p.category, p.price, p.gstRate, p.sustainabilityScore, p.shortDescription, p.description,
        JSON.stringify(p.materials), JSON.stringify(p.certifications), JSON.stringify(p.tags), p.stockCount,
        p.imageUrl, p.imageColor, COUNTRY_OF_ORIGIN, impact.plasticAvoidedG, impact.waterSavedL, impact.wasteDivertedG,
      )
    }
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
}

function seedDemoAccounts(db: DatabaseSync): void {
  if (!DEMO_MODE) return

  const ensureUser = (email: string, name: string, password: string, role: string): number => {
    const existing = db.prepare(`SELECT id FROM users WHERE email = ?`).get(email)
    if (existing) return Number(existing.id)
    const row = db
      .prepare(`INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id`)
      .get(name, email, hashPasswordSync(password), role)
    return Number(row?.id)
  }

  const { admin, vendor, buyer } = DEMO_ACCOUNTS
  ensureUser(buyer.email, buyer.name, buyer.password, 'buyer')
  ensureUser(admin.email, admin.name, admin.password, 'admin')
  const vendorUserId = ensureUser(vendor.email, vendor.name, vendor.password, 'vendor')
  db.prepare(`UPDATE vendors SET user_id = ? WHERE business_name = ? AND user_id IS NULL`).run(vendorUserId, vendor.business)
}

/** Changes whenever the seed catalogue does, so a running dev server knows to seed again. */
export const SEED_FINGERPRINT = [...seedProducts.map(p => p.slug), ...Object.values(DEMO_ACCOUNTS).map(a => a.email)].join(',')

export function seedDatabase(db: DatabaseSync): void {
  seedCatalogue(db)
  seedDemoAccounts(db)
}
