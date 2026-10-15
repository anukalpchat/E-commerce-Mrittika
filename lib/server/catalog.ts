import type { SQLValue } from 'node:sqlite'
import { getDb } from './db'
import type { Category, Product } from '@/lib/products'
import type { ProductImpact } from '@/lib/product-impact'
import { CATEGORY_LABELS, CATEGORY_OPTIONS, ProductInput, ProductStatus, Vendor, VendorProduct, VendorStatus } from '@/lib/vendor-shared'

// Only products that passed review, from vendors who are still approved, are visible to shoppers.
const SHOPPABLE = `p.status = 'active' AND v.status = 'approved'`

const PRODUCT_COLUMNS = `p.*, v.business_name AS vendor_name, v.city AS vendor_city, v.state AS vendor_state`

function parseList(value: SQLValue): string[] {
  try {
    const parsed: unknown = JSON.parse(String(value))
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    throw new Error(`Corrupt JSON list in products table: ${String(value).slice(0, 60)}`)
  }
}

function toProduct(row: Record<string, SQLValue>): Product {
  const category = String(row.category) as Category
  const stock = Number(row.stock_count)
  return {
    slug: String(row.slug),
    name: String(row.name),
    vendor: String(row.vendor_name),
    vendorLocation: `${row.vendor_city}, ${row.vendor_state}`,
    category,
    categoryLabel: CATEGORY_LABELS[category],
    price: Number(row.price),
    gstRate: Number(row.gst_rate),
    sustainabilityScore: Number(row.sustainability_score ?? 0),
    shortDescription: String(row.short_description),
    description: String(row.description),
    materials: parseList(row.materials),
    certifications: parseList(row.certifications),
    inStock: stock > 0,
    stockCount: stock,
    imageColor: String(row.image_color),
    imageUrl: String(row.image_url),
    tags: parseList(row.tags),
    countryOfOrigin: String(row.country_of_origin),
  }
}

export function listActiveProducts(): Product[] {
  return getDb()
    .prepare(`SELECT ${PRODUCT_COLUMNS} FROM products p JOIN vendors v ON v.id = p.vendor_id WHERE ${SHOPPABLE} ORDER BY p.id`)
    .all()
    .map(toProduct)
}

export function getActiveProduct(slug: string): Product | undefined {
  const row = getDb()
    .prepare(`SELECT ${PRODUCT_COLUMNS} FROM products p JOIN vendors v ON v.id = p.vendor_id WHERE p.slug = ? AND ${SHOPPABLE}`)
    .get(slug)
  return row ? toProduct(row) : undefined
}

export function listCategoriesWithCounts(products: Product[]) {
  return CATEGORY_OPTIONS.map(o => ({
    slug: o.value,
    label: o.label,
    count: products.filter(p => p.category === o.value).length,
  }))
}

export function getImpactBySlug(slugs: string[]): Map<string, ProductImpact> {
  const impact = new Map<string, ProductImpact>()
  if (slugs.length === 0) return impact
  const rows = getDb()
    .prepare(`SELECT slug, plastic_avoided_g, water_saved_l, waste_diverted_g FROM products WHERE slug IN (${slugs.map(() => '?').join(', ')})`)
    .all(...slugs)
  for (const r of rows) {
    impact.set(String(r.slug), {
      plasticAvoidedG: Number(r.plastic_avoided_g),
      waterSavedL: Number(r.water_saved_l),
      wasteDivertedG: Number(r.waste_diverted_g),
    })
  }
  return impact
}

// ---------- Vendors ----------

export function toVendor(row: Record<string, SQLValue>): Vendor {
  return {
    id: Number(row.id),
    userId: row.user_id === null ? null : Number(row.user_id),
    businessName: String(row.business_name),
    city: String(row.city),
    state: String(row.state),
    gstin: row.gstin === null ? null : String(row.gstin),
    contactEmail: String(row.contact_email),
    contactPhone: String(row.contact_phone),
    categories: parseList(row.categories) as Category[],
    description: String(row.description),
    practices: String(row.practices),
    status: row.status as VendorStatus,
    commissionRate: Number(row.commission_rate),
    reviewNote: row.review_note === null ? null : String(row.review_note),
    createdAt: String(row.created_at),
    reviewedAt: row.reviewed_at === null ? null : String(row.reviewed_at),
  }
}

export function getVendorByUserId(userId: number): Vendor | null {
  const row = getDb().prepare(`SELECT * FROM vendors WHERE user_id = ?`).get(userId)
  return row ? toVendor(row) : null
}

/** Verified badge: the vendor passed Mrittika's application review. */
export function isVendorVerified(businessName: string): boolean {
  const row = getDb().prepare(`SELECT status FROM vendors WHERE business_name = ?`).get(businessName)
  return row?.status === 'approved'
}

// ---------- Vendor-managed products ----------

export function toVendorProduct(row: Record<string, SQLValue>): VendorProduct {
  return {
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category),
    price: Number(row.price),
    gstRate: Number(row.gst_rate),
    stockCount: Number(row.stock_count),
    shortDescription: String(row.short_description),
    description: String(row.description),
    materials: parseList(row.materials),
    certifications: parseList(row.certifications),
    tags: parseList(row.tags),
    imageUrl: String(row.image_url),
    plasticAvoidedG: Number(row.plastic_avoided_g),
    waterSavedL: Number(row.water_saved_l),
    wasteDivertedG: Number(row.waste_diverted_g),
    status: row.status as ProductStatus,
    sustainabilityScore: row.sustainability_score === null ? null : Number(row.sustainability_score),
    reviewNote: row.review_note === null ? null : String(row.review_note),
    updatedAt: String(row.updated_at),
  }
}

export function listVendorProducts(vendorId: number): VendorProduct[] {
  return getDb().prepare(`SELECT * FROM products WHERE vendor_id = ? ORDER BY updated_at DESC`).all(vendorId).map(toVendorProduct)
}

export function getVendorProduct(vendorId: number, productId: number): VendorProduct | null {
  const row = getDb().prepare(`SELECT * FROM products WHERE id = ? AND vendor_id = ?`).get(productId, vendorId)
  return row ? toVendorProduct(row) : null
}

function uniqueSlug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'product'
  const db = getDb()
  let slug = base
  for (let n = 2; db.prepare(`SELECT 1 FROM products WHERE slug = ?`).get(slug); n++) slug = `${base}-${n}`
  return slug
}

export function createVendorProduct(vendorId: number, input: ProductInput): VendorProduct {
  const row = getDb()
    .prepare(
      `INSERT INTO products (slug, vendor_id, name, category, price, gst_rate, short_description, description,
         materials, certifications, tags, stock_count, image_url, plastic_avoided_g, water_saved_l, waste_diverted_g, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending_review')
       RETURNING *`,
    )
    .get(
      uniqueSlug(input.name), vendorId, input.name.trim(), input.category, input.price, input.gstRate,
      input.shortDescription.trim(), input.description.trim(), JSON.stringify(input.materials),
      JSON.stringify(input.certifications), JSON.stringify(input.tags), input.stockCount, input.imageUrl,
      input.plasticAvoidedG, input.waterSavedL, input.wasteDivertedG,
    )
  if (!row) throw new Error(`Product insert for vendor ${vendorId} returned no row`)
  return toVendorProduct(row)
}

/**
 * Price and stock changes go live immediately. Any change to what the product claims to be
 * (text, materials, certifications, impact figures, photo) sends it back for review.
 */
export function updateVendorProduct(vendorId: number, productId: number, input: ProductInput): VendorProduct | null {
  const current = getVendorProduct(vendorId, productId)
  if (!current) return null

  const claimsChanged =
    current.name !== input.name.trim() ||
    current.category !== input.category ||
    current.gstRate !== input.gstRate ||
    current.shortDescription !== input.shortDescription.trim() ||
    current.description !== input.description.trim() ||
    JSON.stringify(current.materials) !== JSON.stringify(input.materials) ||
    JSON.stringify(current.certifications) !== JSON.stringify(input.certifications) ||
    JSON.stringify(current.tags) !== JSON.stringify(input.tags) ||
    current.imageUrl !== input.imageUrl ||
    current.plasticAvoidedG !== input.plasticAvoidedG ||
    current.waterSavedL !== input.waterSavedL ||
    current.wasteDivertedG !== input.wasteDivertedG

  // A product hidden by an admin stays hidden; vendors cannot un-hide it by editing.
  const nextStatus: ProductStatus = current.status === 'hidden' ? 'hidden' : claimsChanged ? 'pending_review' : current.status

  getDb()
    .prepare(
      `UPDATE products SET name = ?, category = ?, price = ?, gst_rate = ?, short_description = ?, description = ?,
         materials = ?, certifications = ?, tags = ?, stock_count = ?, image_url = ?,
         plastic_avoided_g = ?, water_saved_l = ?, waste_diverted_g = ?, status = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND vendor_id = ?`,
    )
    .run(
      input.name.trim(), input.category, input.price, input.gstRate, input.shortDescription.trim(), input.description.trim(),
      JSON.stringify(input.materials), JSON.stringify(input.certifications), JSON.stringify(input.tags), input.stockCount,
      input.imageUrl, input.plasticAvoidedG, input.waterSavedL, input.wasteDivertedG, nextStatus, productId, vendorId,
    )
  return getVendorProduct(vendorId, productId)
}
