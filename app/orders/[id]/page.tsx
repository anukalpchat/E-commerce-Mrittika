import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import OrderStatusBadge from '@/components/OrderStatusBadge'
import { formatDate, formatDateTime } from '@/lib/format'
import { OrderDetail, splitGst } from '@/lib/orders-shared'
import { formatPrice } from '@/lib/products'
import { getCurrentUser } from '@/lib/server/auth'
import { getOrderForUser } from '@/lib/server/orders'
import OrderActions from './OrderActions'

export const metadata: Metadata = { title: 'Your Order' }
export const dynamic = 'force-dynamic'

const DELIVERY_DAYS = 5

export default function OrderPage({ params }: { params: { id: string } }) {
  const user = getCurrentUser()
  if (!user) redirect(`/auth?next=/orders/${encodeURIComponent(params.id)}`)

  const order = getOrderForUser(user.id, params.id)
  if (!order) notFound()

  const isPaid = ['paid', 'shipped', 'delivered'].includes(order.status)
  const canPay = order.status === 'pending_payment' || order.status === 'payment_failed'

  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand no-print">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <nav className="flex items-center gap-2 text-xs text-mist font-sans mb-3" aria-label="Breadcrumb">
            <Link href="/account?tab=orders" className="hover:text-sienna">My Orders</Link>
            <span>›</span>
            <span className="text-ink font-mono">{order.id}</span>
          </nav>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-display text-4xl text-ink">
              {isPaid ? 'Thank you — your order is confirmed' : 'Your order'}
            </h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-mist font-sans">
            Placed {formatDateTime(order.createdAt)} · Order <span className="font-mono text-ink">{order.id}</span>
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        <OrderActions orderId={order.id} total={order.total} canPay={canPay} canPrint={isPaid} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <section className="md:col-span-2 bg-parchment border border-sand rounded-sm p-6" aria-labelledby="tracking-heading">
            <h2 id="tracking-heading" className="font-display text-2xl text-ink mb-5">Tracking</h2>
            <Timeline order={order} />
          </section>

          <section className="bg-parchment border border-sand rounded-sm p-6 space-y-5" aria-labelledby="delivery-heading">
            <div>
              <h2 id="delivery-heading" className="text-xs font-sans text-gold uppercase tracking-widest mb-2">Delivering to</h2>
              <address className="not-italic text-sm font-sans text-ink leading-relaxed">
                {order.shippingAddress.name}<br />
                {order.shippingAddress.line1}{order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}<br />
                <span className="text-mist">{order.shippingAddress.phone}</span>
              </address>
            </div>
            {isPaid && order.paidAt && (
              <div>
                <p className="text-xs font-sans text-gold uppercase tracking-widest mb-1">Estimated delivery</p>
                <p className="font-display text-xl text-ink">{formatDate(addDays(order.paidAt, DELIVERY_DAYS))}</p>
              </div>
            )}
            {order.paymentMethod && (
              <div>
                <p className="text-xs font-sans text-gold uppercase tracking-widest mb-1">Payment</p>
                <p className="text-sm font-sans text-ink">{order.paymentMethod}</p>
                <p className="text-xs text-mist font-sans">Simulated — no money moved</p>
              </div>
            )}
          </section>
        </div>

        <Invoice order={order} isPaid={isPaid} />

        {isPaid && (
          <div className="bg-canopy/5 border border-canopy/20 rounded-sm p-4 flex flex-wrap items-center justify-between gap-3 no-print">
            <p className="text-sm font-sans text-ink">This order now counts toward your personal impact.</p>
            <Link href="/account/impact" className="font-sans text-xs uppercase tracking-widest text-canopy underline underline-offset-2">
              See my impact →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function Timeline({ order }: { order: OrderDetail }) {
  const isPaid = ['paid', 'shipped', 'delivered'].includes(order.status)
  const reached = new Set(order.events.map(e => e.status))
  // Shipping and delivery updates will come from the vendor dashboard; until then they show as upcoming.
  const upcoming = isPaid
    ? [
        { status: 'shipped', label: 'Shipped by vendor' },
        { status: 'delivered', label: 'Delivered' },
      ].filter(step => !reached.has(step.status))
    : []

  return (
    <ol className="relative border-l border-sand ml-2 space-y-6">
      {order.events.map((e, i) => (
        <li key={i} className="ml-6">
          <span
            className={`absolute -left-[7px] w-3.5 h-3.5 rounded-full border-2 border-parchment ${
              e.status === 'payment_failed' || e.status === 'cancelled' ? 'bg-sienna' : 'bg-canopy'
            }`}
            aria-hidden="true"
          />
          <p className="text-sm font-sans text-ink">{e.note}</p>
          <p className="text-xs font-sans text-mist">{formatDateTime(e.createdAt)}</p>
        </li>
      ))}
      {upcoming.map(step => (
        <li key={step.status} className="ml-6">
          <span className="absolute -left-[7px] w-3.5 h-3.5 rounded-full border-2 border-sand bg-vellum" aria-hidden="true" />
          <p className="text-sm font-sans text-mist">{step.label}</p>
          <p className="text-xs font-sans text-mist/70">Pending — the vendor updates this once dispatched</p>
        </li>
      ))}
    </ol>
  )
}

function Invoice({ order, isPaid }: { order: OrderDetail; isPaid: boolean }) {
  const lines = order.items.map(item => {
    const lineTotal = item.unitPrice * item.quantity
    return { ...item, lineTotal, ...splitGst(lineTotal, item.gstRate) }
  })
  const taxableTotal = lines.reduce((s, l) => s + l.taxable, 0)
  const gstTotal = lines.reduce((s, l) => s + l.gst, 0)

  return (
    <section id="invoice" className="bg-white border border-sand rounded-sm p-6 md:p-8 print-area" aria-labelledby="invoice-heading">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-sand pb-5">
        <div>
          <p className="font-display text-2xl text-gold">Mrittika</p>
          <p className="text-xs text-mist font-sans mt-1">Marketplace for verified sustainable goods</p>
        </div>
        <div className="text-right">
          <h2 id="invoice-heading" className="font-display text-2xl text-ink">{isPaid ? 'Invoice' : 'Order summary'}</h2>
          <p className="text-xs font-sans text-mist">Order <span className="font-mono text-ink">{order.id}</span></p>
          <p className="text-xs font-sans text-mist">Date {formatDate(order.paidAt ?? order.createdAt)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 text-xs font-sans">
        <div>
          <p className="text-gold uppercase tracking-widest mb-1">Billed & shipped to</p>
          <p className="text-ink leading-relaxed">
            {order.shippingAddress.name}<br />
            {order.shippingAddress.line1}{order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-gold uppercase tracking-widest mb-1">Place of supply</p>
          <p className="text-ink">{order.shippingAddress.state}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-sans">
          <thead>
            <tr className="text-left text-mist uppercase tracking-wider border-b border-sand">
              <th className="py-2 pr-3 font-normal">Item</th>
              <th className="py-2 pr-3 font-normal">Sold by</th>
              <th className="py-2 pr-3 font-normal">Origin</th>
              <th className="py-2 pr-3 font-normal text-right">Qty</th>
              <th className="py-2 pr-3 font-normal text-right">Taxable value</th>
              <th className="py-2 pr-3 font-normal text-right">GST</th>
              <th className="py-2 font-normal text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(l => (
              <tr key={l.productSlug} className="border-b border-sand/60 text-ink align-top">
                <td className="py-2 pr-3">
                  <Link href={`/product/${l.productSlug}`} className="hover:text-sienna">{l.productName}</Link>
                  <div className="text-mist">{formatPrice(l.unitPrice)} each</div>
                </td>
                <td className="py-2 pr-3">{l.vendor}<div className="text-mist">{l.vendorLocation}</div></td>
                <td className="py-2 pr-3">{l.countryOfOrigin}</td>
                <td className="py-2 pr-3 text-right">{l.quantity}</td>
                <td className="py-2 pr-3 text-right">{formatPrice(l.taxable)}</td>
                <td className="py-2 pr-3 text-right">{formatPrice(l.gst)}<div className="text-mist">{l.gstRate}%</div></td>
                <td className="py-2 text-right">{formatPrice(l.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-5 ml-auto max-w-xs space-y-1.5 text-xs font-sans">
        <Row label="Taxable value" value={formatPrice(taxableTotal)} />
        <Row label="GST" value={formatPrice(gstTotal)} />
        <Row label="Shipping" value={order.shipping === 0 ? 'FREE' : formatPrice(order.shipping)} />
        <div className="flex justify-between border-t border-sand pt-2">
          <dt className="text-ink font-medium">{isPaid ? 'Total paid' : 'Total due'}</dt>
          <dd className="font-display text-xl text-ink">{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <p className="mt-6 text-[11px] text-mist font-sans leading-relaxed border-t border-sand pt-4">
        Prices are GST-inclusive; the split above is computed from each item&apos;s GST rate. This is a demo document
        for the Mrittika lab project and not a valid tax invoice — vendor GSTINs and HSN codes are not collected yet.
      </p>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-mist">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  )
}
