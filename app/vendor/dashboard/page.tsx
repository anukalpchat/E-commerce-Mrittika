import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import PostButton from '@/components/PostButton'
import StatusPill from '@/components/StatusPill'
import { formatDateTime } from '@/lib/format'
import { formatPrice } from '@/lib/products'
import { listVendorProducts } from '@/lib/server/catalog'
import { computePayouts, getApprovedVendor, listVendorOrders, VendorOrder } from '@/lib/server/vendors'
import type { Vendor } from '@/lib/vendor-shared'
import ProductManager from './ProductManager'

export const metadata: Metadata = { title: 'Vendor Dashboard' }
export const dynamic = 'force-dynamic'

type Tab = 'overview' | 'products' | 'orders' | 'payouts'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'payouts', label: 'Payouts' },
]

export default function VendorDashboardPage({ searchParams }: { searchParams: { tab?: string } }) {
  const session = getApprovedVendor()
  if (!session) redirect('/vendor/register')
  const { vendor } = session
  const tab = TABS.find(t => t.id === searchParams.tab)?.id ?? 'overview'

  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-1">Vendor Dashboard</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl text-ink">{vendor.businessName}</h1>
            <StatusPill tone="good">✓ Verified vendor</StatusPill>
          </div>
          <p className="text-xs text-mist font-sans mt-1">
            {vendor.city}, {vendor.state} · GSTIN {vendor.gstin ?? 'not on file'} · Commission {vendor.commissionRate}%
          </p>
          <nav aria-label="Dashboard sections" className="mt-6 flex gap-1 overflow-x-auto">
            {TABS.map(t => (
              <Link
                key={t.id}
                href={t.id === 'overview' ? '/vendor/dashboard' : `/vendor/dashboard?tab=${t.id}`}
                aria-current={t.id === tab ? 'page' : undefined}
                className={`text-sm font-sans px-4 py-2 rounded-sm whitespace-nowrap ${
                  t.id === tab ? 'bg-forest text-vellum' : 'text-mist hover:text-ink hover:bg-vellum'
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {tab === 'overview' && <Overview vendor={vendor} />}
        {tab === 'products' && <ProductManager products={listVendorProducts(vendor.id)} />}
        {tab === 'orders' && <Orders orders={listVendorOrders(vendor)} />}
        {tab === 'payouts' && <Payouts vendor={vendor} />}
      </div>
    </main>
  )
}

function Tile({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <>
      <p className="text-xs font-sans uppercase tracking-widest text-mist">{label}</p>
      <p className="font-display text-4xl text-ink mt-1">{value}</p>
    </>
  )
  return href ? (
    <Link href={href} className="block bg-parchment border border-sand rounded-sm p-5 hover:border-gold transition-colors">{body}</Link>
  ) : (
    <div className="bg-parchment border border-sand rounded-sm p-5">{body}</div>
  )
}

function Overview({ vendor }: { vendor: Vendor }) {
  const products = listVendorProducts(vendor.id)
  const orders = listVendorOrders(vendor)
  const payouts = computePayouts(vendor)
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label="Live products" value={String(products.filter(p => p.status === 'active').length)} href="/vendor/dashboard?tab=products" />
        <Tile label="Awaiting review" value={String(products.filter(p => p.status === 'pending_review').length)} href="/vendor/dashboard?tab=products" />
        <Tile label="Orders to ship" value={String(orders.filter(o => o.fulfilment === 'to_ship').length)} href="/vendor/dashboard?tab=orders" />
        <Tile label="Net earnings" value={formatPrice(payouts.netEarnings)} href="/vendor/dashboard?tab=payouts" />
      </div>
      <div className="bg-parchment border border-sand rounded-sm p-6">
        <h2 className="font-display text-2xl text-ink">Low stock</h2>
        {products.filter(p => p.status === 'active' && p.stockCount < 20).length === 0 ? (
          <p className="text-sm text-mist font-sans mt-2">All live products have 20 or more units.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm font-sans">
            {products.filter(p => p.status === 'active' && p.stockCount < 20).map(p => (
              <li key={p.id} className="flex justify-between max-w-md">
                <span className="text-ink">{p.name}</span>
                <span className={p.stockCount === 0 ? 'text-sienna' : 'text-mist'}>{p.stockCount} left</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

const FULFILMENT_LABEL = { to_ship: 'To ship', shipped: 'Shipped', delivered: 'Delivered' }

function Orders({ orders }: { orders: VendorOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-sand rounded-sm p-10 text-center bg-parchment/40">
        <p className="font-display text-2xl text-mist">No paid orders yet</p>
        <p className="text-sm text-mist font-sans mt-2">Orders containing your products appear here once the customer has paid.</p>
      </div>
    )
  }
  return (
    <ul className="space-y-4">
      {orders.map(o => (
        <li key={o.id} className="bg-parchment border border-sand rounded-sm p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <p className="font-mono text-ink">{o.id}</p>
                <StatusPill tone={o.fulfilment === 'to_ship' ? 'waiting' : 'good'}>{FULFILMENT_LABEL[o.fulfilment]}</StatusPill>
              </div>
              <p className="text-xs text-mist font-sans mt-1">Paid order placed {formatDateTime(o.createdAt)}</p>
            </div>
            <div className="flex gap-2">
              {o.fulfilment === 'to_ship' && (
                <PostButton url={`/api/vendor/orders/${o.id}`} body={{ status: 'shipped' }} variant="primary">Mark Shipped</PostButton>
              )}
              {o.fulfilment === 'shipped' && (
                <PostButton url={`/api/vendor/orders/${o.id}`} body={{ status: 'delivered' }} variant="primary">Mark Delivered</PostButton>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
            <ul className="space-y-1">
              {o.items.map((i, idx) => (
                <li key={idx} className="flex justify-between gap-4">
                  <span className="text-ink">{i.productName} × {i.quantity}</span>
                  <span className="text-mist">{formatPrice(i.lineTotal)}</span>
                </li>
              ))}
              <li className="flex justify-between gap-4 border-t border-sand pt-1">
                <span className="text-ink font-medium">Your items</span>
                <span className="text-ink">{formatPrice(o.vendorTotal)}</span>
              </li>
            </ul>
            <address className="not-italic text-xs text-mist leading-relaxed md:text-right">
              <span className="text-gold uppercase tracking-widest">Ship to</span><br />
              <span className="text-ink">{o.shipTo.name}</span> · {o.shipTo.phone}<br />
              {o.shipTo.line1}{o.shipTo.line2 && `, ${o.shipTo.line2}`}<br />
              {o.shipTo.city}, {o.shipTo.state} {o.shipTo.pincode}
            </address>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Payouts({ vendor }: { vendor: Vendor }) {
  const p = computePayouts(vendor)
  const orders = listVendorOrders(vendor)
  const rate = p.commissionRate / 100
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-300 rounded-sm px-4 py-3 text-xs font-sans text-amber-900">
        <strong>Statement only.</strong> Payouts are not transferred in this demo. Delivered orders are shown as ready for settlement.
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile label="Gross sales" value={formatPrice(p.grossSales)} />
        <Tile label={`Commission (${p.commissionRate}%)`} value={`− ${formatPrice(p.commission)}`} />
        <Tile label="Ready to settle" value={formatPrice(p.settledNet)} />
        <Tile label="Pending delivery" value={formatPrice(p.pendingNet)} />
      </div>
      {orders.length > 0 && (
        <div className="bg-parchment border border-sand rounded-sm p-5 overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="text-left text-xs text-mist uppercase tracking-widest border-b border-sand">
                <th className="py-2 pr-4 font-normal">Order</th>
                <th className="py-2 pr-4 font-normal">Status</th>
                <th className="py-2 pr-4 font-normal text-right">Sales</th>
                <th className="py-2 pr-4 font-normal text-right">Commission</th>
                <th className="py-2 font-normal text-right">Net</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const commission = Math.round(o.vendorTotal * rate)
                return (
                  <tr key={o.id} className="border-b border-sand/60 text-ink">
                    <td className="py-2 pr-4 font-mono">{o.id}</td>
                    <td className="py-2 pr-4">{o.fulfilment === 'delivered' ? 'Ready to settle' : 'Pending delivery'}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">{formatPrice(o.vendorTotal)}</td>
                    <td className="py-2 pr-4 text-right tabular-nums">− {formatPrice(commission)}</td>
                    <td className="py-2 text-right tabular-nums">{formatPrice(o.vendorTotal - commission)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-mist font-sans max-w-2xl">
        Commission is calculated on the GST-inclusive sale value of your items. Shipping charges are retained by Mrittika.
      </p>
    </div>
  )
}
