import { randomBytes } from 'node:crypto'
import type { SQLValue } from 'node:sqlite'
import { getDb, transaction } from './db'
import { recordConsent } from './consent'
import { getActiveProduct, getImpactBySlug } from './catalog'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal'
import {
  AddressInput,
  MAX_QUANTITY_PER_ITEM,
  OrderDetail,
  OrderItem,
  OrderStatus,
  OrderSummary,
  PAID_STATUSES,
  PaymentOutcome,
  shippingFor,
} from '@/lib/orders-shared'

export class OrderError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export interface CartLine {
  slug: string
  quantity: number
}

function newOrderId(): string {
  // Crockford-style alphabet without look-alike characters, so IDs are easy to read out on a support call.
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  const bytes = randomBytes(8)
  return 'MRT-' + Array.from(bytes, b => alphabet[b % alphabet.length]).join('')
}

/**
 * Prices are always taken from the catalogue on the server; the client only says which products and how many,
 * so a tampered cart cannot change what is charged.
 */
export function createOrder(userId: number, lines: CartLine[], address: AddressInput, request: Request): OrderDetail {
  if (lines.length === 0) throw new OrderError(400, 'Your cart is empty')

  const merged = new Map<string, number>()
  for (const line of lines) merged.set(line.slug, (merged.get(line.slug) ?? 0) + line.quantity)

  const items: OrderItem[] = []
  for (const [slug, quantity] of Array.from(merged)) {
    const product = getActiveProduct(slug)
    if (!product) throw new OrderError(400, `Product "${slug}" is no longer available. Remove it from your cart and try again.`)
    if (!product.inStock) throw new OrderError(409, `${product.name} is out of stock. Remove it from your cart to continue.`)
    if (!Number.isInteger(quantity) || quantity < 1) throw new OrderError(400, `Invalid quantity for ${product.name}`)
    const limit = Math.min(product.stockCount, MAX_QUANTITY_PER_ITEM)
    if (quantity > limit) throw new OrderError(409, `You can order at most ${limit} of ${product.name}`)
    items.push({
      productSlug: product.slug,
      productName: product.name,
      vendor: product.vendor,
      vendorLocation: product.vendorLocation,
      countryOfOrigin: product.countryOfOrigin ?? 'India',
      category: product.categoryLabel,
      unitPrice: product.price,
      gstRate: product.gstRate,
      quantity,
    })
  }

  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  const shipping = shippingFor(subtotal)
  const orderId = newOrderId()

  transaction(db => {
    db.prepare(
      `INSERT INTO orders (id, user_id, status, subtotal, shipping, total,
         ship_name, ship_phone, ship_line1, ship_line2, ship_city, ship_state, ship_pincode)
       VALUES (?, ?, 'pending_payment', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      orderId, userId, subtotal, shipping, subtotal + shipping,
      address.name.trim(), address.phone, address.line1.trim(), address.line2.trim(),
      address.city.trim(), address.state, address.pincode,
    )
    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_slug, product_name, vendor, vendor_location, country_of_origin,
         category, unit_price, gst_rate, quantity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    for (const i of items) {
      insertItem.run(orderId, i.productSlug, i.productName, i.vendor, i.vendorLocation, i.countryOfOrigin, i.category, i.unitPrice, i.gstRate, i.quantity)
    }
    addEvent(orderId, 'pending_payment', 'Order placed — awaiting payment', db)
    recordConsent({ userId, policy: 'terms', policyVersion: TERMS_VERSION, context: 'checkout', request }, db)
    recordConsent({ userId, policy: 'privacy', policyVersion: PRIVACY_VERSION, context: 'checkout', request }, db)
  })

  const order = getOrderForUser(userId, orderId)
  if (!order) throw new Error(`Order ${orderId} was created but could not be read back`)
  return order
}

function addEvent(orderId: string, status: OrderStatus, note: string, db = getDb()): void {
  db.prepare(`INSERT INTO order_events (order_id, status, note) VALUES (?, ?, ?)`).run(orderId, status, note)
}

const PAYABLE_STATUSES: OrderStatus[] = ['pending_payment', 'payment_failed']

/**
 * SIMULATED PAYMENT: the outcome comes from the mock payment modal and is trusted as-is.
 * A real gateway would verify a signed callback from the provider here instead.
 */
export function recordPaymentOutcome(userId: number, orderId: string, outcome: PaymentOutcome, method: string): OrderDetail {
  const order = getOrderForUser(userId, orderId)
  if (!order) throw new OrderError(404, `Order ${orderId} was not found on your account`)
  if (!PAYABLE_STATUSES.includes(order.status)) {
    throw new OrderError(409, `Order ${orderId} is "${order.status}" and can no longer be paid`)
  }

  transaction(db => {
    if (outcome === 'success') {
      const takeStock = db.prepare(`UPDATE products SET stock_count = stock_count - ? WHERE slug = ? AND stock_count >= ?`)
      for (const item of order.items) {
        const result = takeStock.run(item.quantity, item.productSlug, item.quantity)
        if (Number(result.changes) === 0) {
          throw new OrderError(409, `${item.productName} no longer has ${item.quantity} in stock. Nothing was charged; please adjust your cart.`)
        }
      }
      db.prepare(`UPDATE orders SET status = 'paid', payment_method = ?, paid_at = ? WHERE id = ?`).run(method, new Date().toISOString(), orderId)
      addEvent(orderId, 'paid', `Payment received via ${method} (simulated — no money moved)`, db)
    } else if (outcome === 'failed') {
      db.prepare(`UPDATE orders SET status = 'payment_failed', payment_method = ? WHERE id = ?`).run(method, orderId)
      addEvent(orderId, 'payment_failed', `Payment via ${method} failed (simulated). You can retry from the order page.`, db)
    } else {
      db.prepare(`UPDATE orders SET status = 'cancelled' WHERE id = ?`).run(orderId)
      addEvent(orderId, 'cancelled', 'Payment cancelled by customer', db)
    }
  })

  const updated = getOrderForUser(userId, orderId)
  if (!updated) throw new Error(`Order ${orderId} disappeared while recording payment`)
  return updated
}

/** True while a paid order can still be cancelled by the customer: no vendor has dispatched anything yet. */
export function isCancellable(order: OrderDetail): boolean {
  if (order.status !== 'paid') return false
  const shipped = getDb().prepare(`SELECT 1 FROM fulfilments WHERE order_id = ?`).get(order.id)
  return !shipped
}

/** Cancels a paid, undispatched order: returns stock and records a (simulated) full refund. */
export function cancelOrder(userId: number, orderId: string): OrderDetail {
  const order = getOrderForUser(userId, orderId)
  if (!order) throw new OrderError(404, `Order ${orderId} was not found on your account`)
  if (!isCancellable(order)) {
    throw new OrderError(409, `Order ${orderId} can no longer be cancelled online (status "${order.status}"). Request a return instead.`)
  }
  transaction(db => {
    const restock = db.prepare(`UPDATE products SET stock_count = stock_count + ? WHERE slug = ?`)
    for (const item of order.items) restock.run(item.quantity, item.productSlug)
    db.prepare(`UPDATE orders SET status = 'cancelled' WHERE id = ?`).run(orderId)
    addEvent(orderId, 'cancelled', `Cancelled by customer — full refund of ₹${order.total.toLocaleString('en-IN')} issued (simulated)`, db)
  })
  const updated = getOrderForUser(userId, orderId)
  if (!updated) throw new Error(`Order ${orderId} disappeared while cancelling`)
  return updated
}

function str(value: SQLValue): string {
  return value === null ? '' : String(value)
}

export function getOrderForUser(userId: number, orderId: string): OrderDetail | null {
  const db = getDb()
  const row = db.prepare(`SELECT * FROM orders WHERE id = ? AND user_id = ?`).get(orderId, userId)
  if (!row) return null

  const items: OrderItem[] = db
    .prepare(`SELECT * FROM order_items WHERE order_id = ? ORDER BY id`)
    .all(orderId)
    .map(r => ({
      productSlug: str(r.product_slug),
      productName: str(r.product_name),
      vendor: str(r.vendor),
      vendorLocation: str(r.vendor_location),
      countryOfOrigin: str(r.country_of_origin),
      category: str(r.category),
      unitPrice: Number(r.unit_price),
      gstRate: Number(r.gst_rate),
      quantity: Number(r.quantity),
    }))

  const events = db
    .prepare(`SELECT status, note, created_at FROM order_events WHERE order_id = ? ORDER BY id`)
    .all(orderId)
    .map(r => ({ status: str(r.status), note: str(r.note), createdAt: str(r.created_at) }))

  return {
    id: str(row.id),
    status: row.status as OrderStatus,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    paymentMethod: row.payment_method === null ? null : str(row.payment_method),
    createdAt: str(row.created_at),
    paidAt: row.paid_at === null ? null : str(row.paid_at),
    shippingAddress: {
      name: str(row.ship_name),
      phone: str(row.ship_phone),
      line1: str(row.ship_line1),
      line2: str(row.ship_line2),
      city: str(row.ship_city),
      state: str(row.ship_state),
      pincode: str(row.ship_pincode),
    },
    items,
    events,
  }
}

export function listOrdersForUser(userId: number): OrderSummary[] {
  return getDb()
    .prepare(
      `SELECT o.id, o.status, o.total, o.created_at, COALESCE(SUM(i.quantity), 0) AS item_count
       FROM orders o LEFT JOIN order_items i ON i.order_id = o.id
       WHERE o.user_id = ?
       GROUP BY o.id ORDER BY o.created_at DESC`,
    )
    .all(userId)
    .map(r => ({
      id: str(r.id),
      status: r.status as OrderStatus,
      total: Number(r.total),
      itemCount: Number(r.item_count),
      createdAt: str(r.created_at),
    }))
}

export interface ImpactSummary {
  paidOrders: number
  itemsBought: number
  vendorsSupported: number
  amountSpent: number
  plasticAvoidedG: number
  waterSavedL: number
  wasteDivertedG: number
  byCategory: { category: string; items: number; plasticAvoidedG: number; waterSavedL: number; wasteDivertedG: number }[]
  byOrder: { id: string; createdAt: string; items: number; plasticAvoidedG: number; waterSavedL: number; wasteDivertedG: number }[]
}

export function computeImpactForUser(userId: number): ImpactSummary {
  const placeholders = PAID_STATUSES.map(() => '?').join(', ')
  const rows = getDb()
    .prepare(
      `SELECT o.id, o.created_at, o.total, i.product_slug, i.vendor, i.category, i.quantity
       FROM orders o JOIN order_items i ON i.order_id = o.id
       WHERE o.user_id = ? AND o.status IN (${placeholders})
       ORDER BY o.created_at DESC, i.id`,
    )
    .all(userId, ...PAID_STATUSES)

  const summary: ImpactSummary = {
    paidOrders: 0, itemsBought: 0, vendorsSupported: 0, amountSpent: 0,
    plasticAvoidedG: 0, waterSavedL: 0, wasteDivertedG: 0, byCategory: [], byOrder: [],
  }
  const impactBySlug = getImpactBySlug(Array.from(new Set(rows.map(r => str(r.product_slug)))))
  const vendors = new Set<string>()
  const categories = new Map<string, ImpactSummary['byCategory'][number]>()
  const orders = new Map<string, ImpactSummary['byOrder'][number]>()

  for (const r of rows) {
    const quantity = Number(r.quantity)
    const impact = impactBySlug.get(str(r.product_slug)) ?? { plasticAvoidedG: 0, waterSavedL: 0, wasteDivertedG: 0 }
    const plastic = impact.plasticAvoidedG * quantity
    const water = impact.waterSavedL * quantity
    const waste = impact.wasteDivertedG * quantity

    summary.itemsBought += quantity
    summary.plasticAvoidedG += plastic
    summary.waterSavedL += water
    summary.wasteDivertedG += waste
    vendors.add(str(r.vendor))

    const orderId = str(r.id)
    if (!orders.has(orderId)) {
      orders.set(orderId, { id: orderId, createdAt: str(r.created_at), items: 0, plasticAvoidedG: 0, waterSavedL: 0, wasteDivertedG: 0 })
      summary.amountSpent += Number(r.total)
    }
    const o = orders.get(orderId)!
    o.items += quantity
    o.plasticAvoidedG += plastic
    o.waterSavedL += water
    o.wasteDivertedG += waste

    const category = str(r.category)
    const c = categories.get(category) ?? { category, items: 0, plasticAvoidedG: 0, waterSavedL: 0, wasteDivertedG: 0 }
    c.items += quantity
    c.plasticAvoidedG += plastic
    c.waterSavedL += water
    c.wasteDivertedG += waste
    categories.set(category, c)
  }

  summary.paidOrders = orders.size
  summary.vendorsSupported = vendors.size
  summary.byOrder = Array.from(orders.values())
  summary.byCategory = Array.from(categories.values()).sort((a, b) => b.items - a.items)
  return summary
}

export interface PlatformImpact {
  paidOrders: number
  buyers: number
  plasticAvoidedG: number
  waterSavedL: number
  wasteDivertedG: number
}

/** Totals across every customer's paid orders, for the public Our Impact section. */
export function computePlatformImpact(): PlatformImpact {
  const placeholders = PAID_STATUSES.map(() => '?').join(', ')
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT i.product_slug, SUM(i.quantity) AS qty FROM order_items i JOIN orders o ON o.id = i.order_id
       WHERE o.status IN (${placeholders}) GROUP BY i.product_slug`,
    )
    .all(...PAID_STATUSES)
  const impact = getImpactBySlug(rows.map(r => str(r.product_slug)))
  const totals = { plasticAvoidedG: 0, waterSavedL: 0, wasteDivertedG: 0 }
  for (const r of rows) {
    const per = impact.get(str(r.product_slug))
    if (!per) continue
    const qty = Number(r.qty)
    totals.plasticAvoidedG += per.plasticAvoidedG * qty
    totals.waterSavedL += per.waterSavedL * qty
    totals.wasteDivertedG += per.wasteDivertedG * qty
  }
  const counts = db
    .prepare(`SELECT COUNT(*) AS orders, COUNT(DISTINCT user_id) AS buyers FROM orders WHERE status IN (${placeholders})`)
    .get(...PAID_STATUSES)
  return { paidOrders: Number(counts?.orders ?? 0), buyers: Number(counts?.buyers ?? 0), ...totals }
}
