import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import OrderStatusBadge from '@/components/OrderStatusBadge'
import StatusPill, { Tone } from '@/components/StatusPill'
import { formatDateTime } from '@/lib/format'
import { formatPrice, type Category } from '@/lib/products'
import { getCurrentUser } from '@/lib/server/auth'
import { getAdmin, getOverview, listAllOrders, listAllProducts, listConsentLog, listUsers, listVendors } from '@/lib/server/admin'
import { CATEGORY_LABELS, PRODUCT_STATUS_LABELS, ProductStatus, VENDOR_STATUS_LABELS, VendorStatus } from '@/lib/vendor-shared'
import { ProductReviewControls, TicketControls, VendorReviewControls } from './ReviewControls'
import { countOpenTickets, listTickets } from '@/lib/server/support'
import { SUPPORT_TOPICS, TICKET_STATUS_LABELS } from '@/lib/support-shared'

export const metadata: Metadata = { title: 'Admin Panel' }
export const dynamic = 'force-dynamic'

type Tab = 'overview' | 'vendors' | 'products' | 'orders' | 'support' | 'consents' | 'users'
const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'support', label: 'Support & Grievances' },
  { id: 'consents', label: 'Consent Log' },
  { id: 'users', label: 'Users' },
]

const VENDOR_TONE: Record<VendorStatus, Tone> = { pending: 'waiting', approved: 'good', rejected: 'bad', suspended: 'muted' }
const PRODUCT_TONE: Record<ProductStatus, Tone> = { pending_review: 'waiting', active: 'good', rejected: 'bad', hidden: 'muted' }

export default function AdminPage({ searchParams }: { searchParams: { tab?: string } }) {
  if (!getCurrentUser()) redirect('/auth?next=/admin')
  const admin = getAdmin()
  if (!admin) {
    return (
      <main className="min-h-screen bg-vellum flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="font-display text-4xl text-ink">Admins only</p>
          <p className="text-sm text-mist font-sans mt-3">Your account does not have access to the admin panel.</p>
          <Link href="/" className="inline-block mt-6 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3">Go Home</Link>
        </div>
      </main>
    )
  }
  const tab = TABS.find(t => t.id === searchParams.tab)?.id ?? 'overview'
  const overview = getOverview()
  const openTickets = countOpenTickets()

  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-forest text-vellum">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-1">Admin Panel</p>
          <h1 className="font-display text-4xl">Mrittika Operations</h1>
          <p className="text-xs text-sand font-sans mt-1">Signed in as {admin.email}</p>
          <nav aria-label="Admin sections" className="mt-6 flex gap-1 overflow-x-auto">
            {TABS.map(t => {
              const badge = t.id === 'vendors' ? overview.vendors.pending : t.id === 'products' ? overview.productsAwaitingReview : t.id === 'support' ? openTickets : 0
              return (
                <Link
                  key={t.id}
                  href={t.id === 'overview' ? '/admin' : `/admin?tab=${t.id}`}
                  aria-current={t.id === tab ? 'page' : undefined}
                  className={`text-sm font-sans px-4 py-2 rounded-sm whitespace-nowrap flex items-center gap-2 ${
                    t.id === tab ? 'bg-vellum text-forest' : 'text-sand hover:text-vellum'
                  }`}
                >
                  {t.label}
                  {badge > 0 && <span className="bg-gold text-forest text-[11px] rounded-full px-1.5 leading-5">{badge}</span>}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {tab === 'overview' && <Overview overview={overview} openTickets={openTickets} />}
        {tab === 'vendors' && <Vendors />}
        {tab === 'products' && <Products />}
        {tab === 'orders' && <Orders />}
        {tab === 'support' && <Support />}
        {tab === 'consents' && <Consents />}
        {tab === 'users' && <Users />}
      </div>
    </main>
  )
}

function Tile({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <>
      <p className="text-xs font-sans uppercase tracking-widest text-mist">{label}</p>
      <p className="font-display text-4xl text-ink mt-1">{value}</p>
    </>
  )
  return href ? (
    <Link href={href} className="block bg-parchment border border-sand rounded-sm p-5 hover:border-gold">{inner}</Link>
  ) : (
    <div className="bg-parchment border border-sand rounded-sm p-5">{inner}</div>
  )
}

function Overview({ overview, openTickets }: { overview: ReturnType<typeof getOverview>; openTickets: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Tile label="Vendor applications" value={String(overview.vendors.pending)} href="/admin?tab=vendors" />
      <Tile label="Products to review" value={String(overview.productsAwaitingReview)} href="/admin?tab=products" />
      <Tile label="Approved vendors" value={String(overview.vendors.approved)} href="/admin?tab=vendors" />
      <Tile label="Live products" value={String(overview.productsLive)} href="/admin?tab=products" />
      <Tile label="Paid orders" value={String(overview.paidOrders)} href="/admin?tab=orders" />
      <Tile label="GMV (paid)" value={formatPrice(overview.gmv)} />
      <Tile label="Platform commission" value={formatPrice(overview.platformCommission)} />
      <Tile label="Registered users" value={String(overview.users)} href="/admin?tab=users" />
      <Tile label="Open support tickets" value={String(openTickets)} href="/admin?tab=support" />
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="border border-dashed border-sand rounded-sm p-8 text-center text-sm text-mist font-sans bg-parchment/40">{text}</p>
}

function Vendors() {
  const vendors = listVendors()
  if (vendors.length === 0) return <Empty text="No vendors yet." />
  return (
    <ul className="space-y-4">
      {vendors.map(v => (
        <li key={v.id} className="bg-parchment border border-sand rounded-sm p-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-xl text-ink">{v.businessName}</p>
            <StatusPill tone={VENDOR_TONE[v.status]}>{VENDOR_STATUS_LABELS[v.status]}</StatusPill>
            <span className="text-xs text-mist font-sans">{v.productCount} products · {v.commissionRate}% commission</span>
          </div>
          <p className="text-xs text-mist font-sans mt-1">
            {v.city}, {v.state} · GSTIN <span className="font-mono">{v.gstin ?? '—'}</span> · {v.contactEmail} · {v.contactPhone} · applied {formatDateTime(v.createdAt)}
          </p>
          <p className="text-xs text-mist font-sans mt-1">Categories: {v.categories.map(c => CATEGORY_LABELS[c]).join(', ')}</p>
          {v.status === 'pending' && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sans">
              <div><p className="text-xs text-gold uppercase tracking-widest mb-1">About</p><p className="text-ink whitespace-pre-line">{v.description}</p></div>
              <div><p className="text-xs text-gold uppercase tracking-widest mb-1">Practices</p><p className="text-ink whitespace-pre-line">{v.practices}</p></div>
            </div>
          )}
          {v.reviewNote && <p className="text-xs text-sienna font-sans mt-2">Note: {v.reviewNote}</p>}
          <div className="mt-4"><VendorReviewControls vendorId={v.id} status={v.status} commissionRate={v.commissionRate} /></div>
        </li>
      ))}
    </ul>
  )
}

function Products() {
  const products = listAllProducts()
  if (products.length === 0) return <Empty text="No products yet." />
  return (
    <ul className="space-y-3">
      {products.map(p => (
        <li key={p.id} className="bg-parchment border border-sand rounded-sm p-4 flex flex-wrap gap-4">
          <div className="w-20 h-20 relative rounded-sm overflow-hidden shrink-0 bg-sand/40">
            <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="80px" />
          </div>
          <div className="flex-1 min-w-[16rem] space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg text-ink">{p.name}</p>
              <StatusPill tone={PRODUCT_TONE[p.status]}>{PRODUCT_STATUS_LABELS[p.status]}</StatusPill>
            </div>
            <p className="text-xs text-mist font-sans">
              {p.vendorName} · {CATEGORY_LABELS[p.category as Category]} · {formatPrice(p.price)} ({p.gstRate}% GST) · {p.stockCount} in stock
              {p.sustainabilityScore !== null && <> · Score {p.sustainabilityScore}/100</>}
            </p>
            {p.status === 'pending_review' && (
              <div className="text-xs font-sans text-ink space-y-1 pt-1">
                <p>{p.shortDescription}</p>
                <p className="text-mist">Materials: {p.materials.join(', ')} · Certifications: {p.certifications.join(', ') || 'none claimed'}</p>
                <p className="text-mist">
                  Impact claims per unit: {p.plasticAvoidedG} g plastic · {p.waterSavedL} L water · {p.wasteDivertedG} g waste
                </p>
              </div>
            )}
            <div className="pt-2"><ProductReviewControls productId={p.id} status={p.status} /></div>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="bg-parchment border border-sand rounded-sm p-4 overflow-x-auto">
      <table className="w-full text-xs font-sans">
        <thead>
          <tr className="text-left text-mist uppercase tracking-widest border-b border-sand">
            {head.map(h => <th key={h} className="py-2 pr-4 font-normal whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody className="text-ink">{children}</tbody>
      </table>
    </div>
  )
}

function Orders() {
  const orders = listAllOrders()
  if (orders.length === 0) return <Empty text="No orders yet." />
  return (
    <Table head={['Order', 'Placed', 'Customer', 'Vendors', 'Total', 'Status']}>
      {orders.map(o => (
        <tr key={o.id} className="border-b border-sand/60 align-top">
          <td className="py-2 pr-4 font-mono">{o.id}</td>
          <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
          <td className="py-2 pr-4">{o.customerEmail}</td>
          <td className="py-2 pr-4">{o.vendors.split(',').join(', ')}</td>
          <td className="py-2 pr-4 tabular-nums">{formatPrice(o.total)}</td>
          <td className="py-2"><OrderStatusBadge status={o.status} /></td>
        </tr>
      ))}
    </Table>
  )
}

const TOPIC_LABELS = Object.fromEntries(SUPPORT_TOPICS.map(t => [t.value, t.label]))
const TICKET_TONE: Record<string, Tone> = { open: 'waiting', in_progress: 'waiting', resolved: 'good' }

function Support() {
  const tickets = listTickets()
  if (tickets.length === 0) return <Empty text="No support tickets yet." />
  const now = new Date().toISOString()
  return (
    <div className="space-y-3">
      <p className="text-sm text-mist font-sans max-w-3xl">
        Open tickets first, grievances on top. Deadlines follow the E-Commerce Rules: acknowledge within 48 hours, resolve within 30 days.
      </p>
      <ul className="space-y-3">
        {tickets.map(t => {
          const overdue = t.status !== 'resolved' && (t.status === 'open' ? now > t.acknowledgeBy : now > t.resolveBy)
          return (
            <li key={t.id} className={`bg-parchment border rounded-sm p-5 ${overdue ? 'border-sienna/60' : 'border-sand'}`}>
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-ink">{t.id}</p>
                <StatusPill tone={TICKET_TONE[t.status]}>{TICKET_STATUS_LABELS[t.status]}</StatusPill>
                <StatusPill tone={t.topic === 'grievance' ? 'bad' : 'muted'}>{TOPIC_LABELS[t.topic]}</StatusPill>
                {overdue && <StatusPill tone="bad">Overdue</StatusPill>}
              </div>
              <p className="text-xs text-mist font-sans mt-1">
                {t.name} · {t.email} · {formatDateTime(t.createdAt)}
                {t.orderId && <> · Order <span className="font-mono">{t.orderId}</span></>}
                {t.status === 'open' && <> · acknowledge by {formatDateTime(t.acknowledgeBy)}</>}
                {t.status === 'in_progress' && <> · resolve by {formatDateTime(t.resolveBy)}</>}
              </p>
              <p className="text-sm font-sans text-ink mt-3 whitespace-pre-line">{t.message}</p>
              <div className="mt-4"><TicketControls ticketId={t.id} status={t.status} adminNote={t.adminNote} /></div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const POLICY_LABELS: Record<string, string> = { terms: 'Terms & Conditions', privacy: 'Privacy Policy' }

const CONTEXT_LABELS: Record<string, string> = { registration: 'Registration', checkout: 'Checkout', 'vendor-application': 'Vendor application' }

function Consents() {
  const log = listConsentLog()
  return (
    <div className="space-y-3">
      <p className="text-sm text-mist font-sans max-w-3xl">
        Every acceptance of the Terms & Conditions, with the policy version shown at the time. Most recent 300 entries.
      </p>
      {log.length === 0 ? <Empty text="No consents recorded yet." /> : (
        <Table head={['When', 'User', 'Policy', 'Version', 'Context', 'IP']}>
          {log.map(c => (
            <tr key={c.id} className="border-b border-sand/60">
              <td className="py-2 pr-4 whitespace-nowrap">{formatDateTime(c.acceptedAt)}</td>
              <td className="py-2 pr-4">{c.email}</td>
              <td className="py-2 pr-4">{POLICY_LABELS[c.policy] ?? c.policy}</td>
              <td className="py-2 pr-4 font-mono">{c.policyVersion}</td>
              <td className="py-2 pr-4">{CONTEXT_LABELS[c.context] ?? c.context}</td>
              <td className="py-2 font-mono">{c.ipAddress ?? '—'}</td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  )
}

function Users() {
  const users = listUsers()
  return (
    <Table head={['Name', 'Email', 'Role', 'Orders', 'Joined']}>
      {users.map(u => (
        <tr key={u.id} className="border-b border-sand/60">
          <td className="py-2 pr-4">{u.name}</td>
          <td className="py-2 pr-4">{u.email}</td>
          <td className="py-2 pr-4 capitalize">{u.role}</td>
          <td className="py-2 pr-4 tabular-nums">{u.orders}</td>
          <td className="py-2 whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
        </tr>
      ))}
    </Table>
  )
}
