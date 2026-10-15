import { getDb } from './db'
import { getProduct, type Product } from '@/lib/products'
import type { AddressInput, SavedAddress } from '@/lib/orders-shared'

const MAX_SAVED_ADDRESSES = 10

export function updateProfile(userId: number, name: string, phone: string | null): void {
  getDb().prepare(`UPDATE users SET name = ?, phone = ? WHERE id = ?`).run(name, phone, userId)
}

export function listAddresses(userId: number): SavedAddress[] {
  return getDb()
    .prepare(`SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC`)
    .all(userId)
    .map(r => ({
      id: Number(r.id),
      name: String(r.name),
      phone: String(r.phone),
      line1: String(r.line1),
      line2: String(r.line2),
      city: String(r.city),
      state: String(r.state),
      pincode: String(r.pincode),
    }))
}

/** Returns null when the user already has the maximum number of saved addresses. */
export function saveAddress(userId: number, address: AddressInput): SavedAddress | null {
  const db = getDb()
  const count = Number(db.prepare(`SELECT COUNT(*) AS n FROM addresses WHERE user_id = ?`).get(userId)?.n ?? 0)
  if (count >= MAX_SAVED_ADDRESSES) return null

  const duplicate = db
    .prepare(`SELECT id FROM addresses WHERE user_id = ? AND line1 = ? AND pincode = ? AND name = ?`)
    .get(userId, address.line1.trim(), address.pincode, address.name.trim())
  if (duplicate) return listAddresses(userId).find(a => a.id === Number(duplicate.id)) ?? null

  const row = db
    .prepare(
      `INSERT INTO addresses (user_id, name, phone, line1, line2, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
    .get(userId, address.name.trim(), address.phone, address.line1.trim(), address.line2.trim(), address.city.trim(), address.state, address.pincode)
  return { id: Number(row?.id), ...address }
}

export function deleteAddress(userId: number, addressId: number): boolean {
  const result = getDb().prepare(`DELETE FROM addresses WHERE id = ? AND user_id = ?`).run(addressId, userId)
  return Number(result.changes) > 0
}

export function getAddress(userId: number, addressId: number): SavedAddress | null {
  return listAddresses(userId).find(a => a.id === addressId) ?? null
}

export function listWishlist(userId: number): Product[] {
  return getDb()
    .prepare(`SELECT product_slug FROM wishlist WHERE user_id = ? ORDER BY created_at DESC`)
    .all(userId)
    .map(r => getProduct(String(r.product_slug)))
    .filter((p): p is Product => p !== undefined)
}

export function addToWishlist(userId: number, slug: string): void {
  getDb().prepare(`INSERT OR IGNORE INTO wishlist (user_id, product_slug) VALUES (?, ?)`).run(userId, slug)
}

export function removeFromWishlist(userId: number, slug: string): void {
  getDb().prepare(`DELETE FROM wishlist WHERE user_id = ? AND product_slug = ?`).run(userId, slug)
}
