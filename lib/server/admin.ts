import { getDb, transaction } from './db'
import { getCurrentUser } from './auth'
import { toVendor, toVendorProduct } from './catalog'
import type { PublicUser } from '@/lib/auth-types'
import { OrderStatus, PAID_STATUSES } from '@/lib/orders-shared'
import type { Vendor, VendorProduct, VendorStatus } from '@/lib/vendor-shared'
import { MINIMUM_LISTING_SCORE } from '@/lib/scoring'

export class AdminError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function getAdmin(): PublicUser | null {
  const user = getCurrentUser()
  return user && user.role === 'admin' ? user : null
}

export interface AdminOverview {
  users: number
  vendors: Record<VendorStatus, number>
  productsLive: number
  productsAwaitingReview: number
  paidOrders: number
  gmv: number
  platformCommission: number
}

export function getOverview(): AdminOverview {
  const db = getDb()
  const count = (sql: string, ...params: string[]) => Number(db.prepare(sql).get(...params)?.n ?? 0)
  const vendors: Record<VendorStatus, number> = { pending: 0, approved: 0, rejected: 0, suspended: 0 }
  for (const r of db.prepare(`SELECT status, COUNT(*) AS n FROM vendors GROUP BY status`).all()) {
    vendors[r.status as VendorStatus] = Number(r.n)
  }
  const placeholders = PAID_STATUSES.map(() => '?').join(', ')
  const sales = db
    .prepare(
      `SELECT COUNT(DISTINCT o.id) AS orders, COALESCE(SUM(i.unit_price * i.quantity), 0) AS gmv,
              COALESCE(SUM(ROUND(i.unit_price * i.quantity * v.commission_rate / 100)), 0) AS commission
       FROM orders o JOIN order_items i ON i.order_id = o.id LEFT JOIN vendors v ON v.business_name = i.vendor
       WHERE o.status IN (${placeholders})`,
    )
    .get(...PAID_STATUSES)
  return {
    users: count(`SELECT COUNT(*) AS n FROM users`),
    vendors,
    productsLive: count(`SELECT COUNT(*) AS n FROM products WHERE status = 'active'`),
    productsAwaitingReview: count(`SELECT COUNT(*) AS n FROM products WHERE status = 'pending_review'`),
    paidOrders: Number(sales?.orders ?? 0),
    gmv: Number(sales?.gmv ?? 0),
    platformCommission: Number(sales?.commission ?? 0),
  }
}

// ---------- Vendors ----------

export function listVendors(): (Vendor & { productCount: number })[] {
  return getDb()
    .prepare(
      `SELECT v.*, (SELECT COUNT(*) FROM products p WHERE p.vendor_id = v.id) AS product_count
       FROM vendors v
       ORDER BY CASE v.status WHEN 'pending' THEN 0 ELSE 1 END, v.created_at DESC`,
    )
    .all()
    .map(r => ({ ...toVendor(r), productCount: Number(r.product_count) }))
}

export type VendorAction = 'approve' | 'reject' | 'suspend' | 'reinstate'

const VENDOR_TRANSITIONS: Record<VendorAction, { from: VendorStatus[]; to: VendorStatus }> = {
  approve: { from: ['pending'], to: 'approved' },
  reject: { from: ['pending'], to: 'rejected' },
  suspend: { from: ['approved'], to: 'suspended' },
  reinstate: { from: ['suspended'], to: 'approved' },
}

export function reviewVendor(vendorId: number, action: VendorAction, note: string, commissionRate: number | null): void {
  const row = getDb().prepare(`SELECT * FROM vendors WHERE id = ?`).get(vendorId)
  if (!row) throw new AdminError(404, `Vendor ${vendorId} not found`)
  const vendor = toVendor(row)
  const transition = VENDOR_TRANSITIONS[action]
  if (!transition.from.includes(vendor.status)) {
    throw new AdminError(409, `Cannot ${action} ${vendor.businessName}: status is "${vendor.status}"`)
  }
  if ((action === 'reject' || action === 'suspend') && note.trim().length < 5) {
    throw new AdminError(400, 'Give the vendor a reason (at least 5 characters)')
  }

  transaction(db => {
    db.prepare(
      `UPDATE vendors SET status = ?, review_note = ?, reviewed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
         commission_rate = COALESCE(?, commission_rate)
       WHERE id = ?`,
    ).run(transition.to, note.trim() || null, commissionRate, vendorId)
    // Approval is what turns a buyer account into a vendor account; admins keep their role.
    if (action === 'approve' && vendor.userId !== null) {
      db.prepare(`UPDATE users SET role = 'vendor' WHERE id = ? AND role = 'buyer'`).run(vendor.userId)
    }
  })
}

// ---------- Products ----------

export type AdminProduct = VendorProduct & { vendorName: string }

export function listAllProducts(): AdminProduct[] {
  return getDb()
    .prepare(
      `SELECT p.*, v.business_name AS vendor_name FROM products p JOIN vendors v ON v.id = p.vendor_id
       ORDER BY CASE p.status WHEN 'pending_review' THEN 0 ELSE 1 END, p.updated_at DESC`,
    )
    .all()
    .map(r => ({ ...toVendorProduct(r), vendorName: String(r.vendor_name) }))
}

export type ProductAction = 'approve' | 'reject' | 'hide' | 'unhide'

export function reviewProduct(productId: number, action: ProductAction, score: number | null, note: string): void {
  const row = getDb().prepare(`SELECT * FROM products WHERE id = ?`).get(productId)
  if (!row) throw new AdminError(404, `Product ${productId} not found`)
  const product = toVendorProduct(row)

  let status: string
  if (action === 'approve') {
    if (product.status !== 'pending_review') throw new AdminError(409, `${product.name} is not awaiting review`)
    if (score === null || !Number.isInteger(score) || score < 0 || score > 100) {
      throw new AdminError(400, 'Set a sustainability score between 0 and 100 to approve')
    }
    if (score < MINIMUM_LISTING_SCORE) {
      throw new AdminError(400, `Products scoring below ${MINIMUM_LISTING_SCORE} are not listed. Reject it with a note explaining what would raise the score.`)
    }
    status = 'active'
  } else if (action === 'reject') {
    if (product.status !== 'pending_review') throw new AdminError(409, `${product.name} is not awaiting review`)
    if (note.trim().length < 5) throw new AdminError(400, 'Give the vendor a reason (at least 5 characters)')
    status = 'rejected'
  } else if (action === 'hide') {
    if (product.status !== 'active') throw new AdminError(409, `${product.name} is not live`)
    status = 'hidden'
  } else {
    if (product.status !== 'hidden') throw new AdminError(409, `${product.name} is not hidden`)
    status = 'active'
  }

  getDb()
    .prepare(
      `UPDATE products SET status = ?, sustainability_score = COALESCE(?, sustainability_score), review_note = ?,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ?`,
    )
    .run(status, action === 'approve' ? score : null, note.trim() || null, productId)
}

// ---------- Orders, consents, users ----------

export interface AdminOrderRow {
  id: string
  status: OrderStatus
  total: number
  createdAt: string
  customerEmail: string
  vendors: string
}

export function listAllOrders(): AdminOrderRow[] {
  return getDb()
    .prepare(
      `SELECT o.id, o.status, o.total, o.created_at, u.email, GROUP_CONCAT(DISTINCT i.vendor) AS vendors
       FROM orders o JOIN users u ON u.id = o.user_id LEFT JOIN order_items i ON i.order_id = o.id
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT 200`,
    )
    .all()
    .map(r => ({
      id: String(r.id),
      status: r.status as OrderStatus,
      total: Number(r.total),
      createdAt: String(r.created_at),
      customerEmail: String(r.email),
      vendors: String(r.vendors ?? ''),
    }))
}

export interface ConsentLogRow {
  id: number
  email: string
  policy: string
  policyVersion: string
  context: string
  ipAddress: string | null
  acceptedAt: string
}

export function listConsentLog(): ConsentLogRow[] {
  return getDb()
    .prepare(
      `SELECT c.id, u.email, c.policy, c.policy_version, c.context, c.ip_address, c.accepted_at
       FROM consents c JOIN users u ON u.id = c.user_id ORDER BY c.accepted_at DESC, c.id DESC LIMIT 300`,
    )
    .all()
    .map(r => ({
      id: Number(r.id),
      email: String(r.email),
      policy: String(r.policy),
      policyVersion: String(r.policy_version),
      context: String(r.context),
      ipAddress: r.ip_address === null ? null : String(r.ip_address),
      acceptedAt: String(r.accepted_at),
    }))
}

export function listUsers(): (PublicUser & { orders: number })[] {
  return getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at, (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS orders
       FROM users u ORDER BY u.created_at DESC LIMIT 300`,
    )
    .all()
    .map(r => ({
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      phone: r.phone === null ? null : String(r.phone),
      role: r.role as PublicUser['role'],
      createdAt: String(r.created_at),
      orders: Number(r.orders),
    }))
}
