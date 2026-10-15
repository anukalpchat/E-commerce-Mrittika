import { getDb, transaction } from './db'
import { getCurrentUser } from './auth'
import { getVendorByUserId } from './catalog'
import { recordConsent } from './consent'
import { OrderError } from './orders'
import { TERMS_VERSION } from '@/lib/legal'
import type { PublicUser } from '@/lib/auth-types'
import { AddressInput, OrderStatus, PAID_STATUSES } from '@/lib/orders-shared'
import { Vendor, VendorApplicationInput } from '@/lib/vendor-shared'

export class VendorError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

/** The signed-in user and their vendor record, only if the vendor is approved. */
export function getApprovedVendor(): { user: PublicUser; vendor: Vendor } | null {
  const user = getCurrentUser()
  if (!user) return null
  const vendor = getVendorByUserId(user.id)
  if (!vendor || vendor.status !== 'approved') return null
  return { user, vendor }
}

export function submitVendorApplication(user: PublicUser, input: VendorApplicationInput, request: Request): Vendor {
  const existing = getVendorByUserId(user.id)
  if (existing && existing.status !== 'rejected') {
    throw new VendorError(409, `You already have a vendor account (${existing.status}). Only rejected applications can be resubmitted.`)
  }
  const businessName = input.businessName.trim()
  const clash = getDb().prepare(`SELECT id FROM vendors WHERE business_name = ? COLLATE NOCASE AND id IS NOT ?`).get(businessName, existing?.id ?? null)
  if (clash) throw new VendorError(409, `A vendor named "${businessName}" is already registered. Use your exact registered business name or contact us.`)

  const values = [
    businessName, input.city.trim(), input.state, input.gstin.trim().toUpperCase(), input.contactPhone,
    JSON.stringify(input.categories), input.description.trim(), input.practices.trim(),
  ]

  transaction(db => {
    if (existing) {
      db.prepare(
        `UPDATE vendors SET business_name = ?, city = ?, state = ?, gstin = ?, contact_phone = ?, categories = ?,
           description = ?, practices = ?, status = 'pending', review_note = NULL, reviewed_at = NULL
         WHERE id = ?`,
      ).run(...values, existing.id)
    } else {
      db.prepare(
        `INSERT INTO vendors (business_name, city, state, gstin, contact_phone, categories, description, practices, user_id, contact_email)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(...values, user.id, user.email)
    }
    recordConsent({ userId: user.id, policy: 'terms', policyVersion: TERMS_VERSION, context: 'vendor-application', request }, db)
  })

  const vendor = getVendorByUserId(user.id)
  if (!vendor) throw new Error(`Vendor application for user ${user.id} was saved but could not be read back`)
  return vendor
}

// ---------- Orders and fulfilment ----------

export type FulfilmentStatus = 'to_ship' | 'shipped' | 'delivered'

export interface VendorOrder {
  id: string
  createdAt: string
  orderStatus: OrderStatus
  fulfilment: FulfilmentStatus
  shipTo: AddressInput
  items: { productName: string; quantity: number; lineTotal: number }[]
  vendorTotal: number
}

export function listVendorOrders(vendor: Vendor): VendorOrder[] {
  const placeholders = PAID_STATUSES.map(() => '?').join(', ')
  const rows = getDb()
    .prepare(
      `SELECT o.id, o.created_at, o.status, o.ship_name, o.ship_phone, o.ship_line1, o.ship_line2, o.ship_city, o.ship_state, o.ship_pincode,
              i.product_name, i.quantity, i.unit_price, f.status AS fulfilment
       FROM orders o
       JOIN order_items i ON i.order_id = o.id AND i.vendor = ?
       LEFT JOIN fulfilments f ON f.order_id = o.id AND f.vendor = ?
       WHERE o.status IN (${placeholders})
       ORDER BY o.created_at DESC, i.id`,
    )
    .all(vendor.businessName, vendor.businessName, ...PAID_STATUSES)

  const orders = new Map<string, VendorOrder>()
  for (const r of rows) {
    const id = String(r.id)
    let order = orders.get(id)
    if (!order) {
      order = {
        id,
        createdAt: String(r.created_at),
        orderStatus: r.status as OrderStatus,
        fulfilment: (r.fulfilment ?? 'to_ship') as FulfilmentStatus,
        shipTo: {
          name: String(r.ship_name), phone: String(r.ship_phone), line1: String(r.ship_line1), line2: String(r.ship_line2),
          city: String(r.ship_city), state: String(r.ship_state), pincode: String(r.ship_pincode),
        },
        items: [],
        vendorTotal: 0,
      }
      orders.set(id, order)
    }
    const lineTotal = Number(r.unit_price) * Number(r.quantity)
    order.items.push({ productName: String(r.product_name), quantity: Number(r.quantity), lineTotal })
    order.vendorTotal += lineTotal
  }
  return Array.from(orders.values())
}

const NEXT_FULFILMENT: Record<FulfilmentStatus, FulfilmentStatus | null> = { to_ship: 'shipped', shipped: 'delivered', delivered: null }

export function advanceFulfilment(vendor: Vendor, orderId: string, target: 'shipped' | 'delivered'): void {
  const order = listVendorOrders(vendor).find(o => o.id === orderId)
  if (!order) throw new OrderError(404, `Paid order ${orderId} with your products was not found`)
  if (NEXT_FULFILMENT[order.fulfilment] !== target) {
    throw new OrderError(409, `Order ${orderId} is "${order.fulfilment.replace('_', ' ')}" for you, so it cannot be marked ${target}`)
  }

  transaction(db => {
    db.prepare(
      `INSERT INTO fulfilments (order_id, vendor, status) VALUES (?, ?, ?)
       ON CONFLICT (order_id, vendor) DO UPDATE SET status = excluded.status, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    ).run(orderId, vendor.businessName, target)
    const verb = target === 'shipped' ? 'Shipped' : 'Delivered'
    db.prepare(`INSERT INTO order_events (order_id, status, note) VALUES (?, ?, ?)`).run(
      orderId, target, `${verb} by ${vendor.businessName}`,
    )

    // The order as a whole moves forward only once every vendor in it has.
    const vendorsInOrder = db.prepare(`SELECT DISTINCT vendor FROM order_items WHERE order_id = ?`).all(orderId).map(r => String(r.vendor))
    const statuses = new Map(
      db.prepare(`SELECT vendor, status FROM fulfilments WHERE order_id = ?`).all(orderId).map(r => [String(r.vendor), String(r.status)]),
    )
    const all = (s: string[]) => vendorsInOrder.every(v => s.includes(statuses.get(v) ?? ''))
    const nextOrderStatus = all(['delivered']) ? 'delivered' : all(['shipped', 'delivered']) ? 'shipped' : null
    if (nextOrderStatus && nextOrderStatus !== order.orderStatus) {
      db.prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(nextOrderStatus, orderId)
      if (vendorsInOrder.length > 1) {
        db.prepare(`INSERT INTO order_events (order_id, status, note) VALUES (?, ?, ?)`).run(
          orderId, nextOrderStatus, nextOrderStatus === 'delivered' ? 'All items delivered' : 'All items shipped',
        )
      }
    }
  })
}

// ---------- Payouts ----------

export interface PayoutSummary {
  commissionRate: number
  grossSales: number
  commission: number
  netEarnings: number
  settledNet: number
  pendingNet: number
  ordersCount: number
}

/**
 * Statement only: no money moves. Delivered orders count as ready for settlement; paid or shipped ones are pending.
 * Commission is charged on GST-inclusive sales value, which is a simplification for the demo.
 */
export function computePayouts(vendor: Vendor): PayoutSummary {
  const orders = listVendorOrders(vendor)
  // Rounded per order so the totals match the per-order statement rows exactly.
  const commissionOn = (o: VendorOrder) => Math.round(o.vendorTotal * vendor.commissionRate / 100)
  const sum = (list: VendorOrder[], f: (o: VendorOrder) => number) => list.reduce((s, o) => s + f(o), 0)
  const delivered = orders.filter(o => o.fulfilment === 'delivered')
  const pending = orders.filter(o => o.fulfilment !== 'delivered')
  const grossSales = sum(orders, o => o.vendorTotal)
  const commission = sum(orders, commissionOn)
  return {
    commissionRate: vendor.commissionRate,
    grossSales,
    commission,
    netEarnings: grossSales - commission,
    settledNet: sum(delivered, o => o.vendorTotal - commissionOn(o)),
    pendingNet: sum(pending, o => o.vendorTotal - commissionOn(o)),
    ordersCount: orders.length,
  }
}
