import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import OrderStatusBadge from '@/components/OrderStatusBadge'
import { formatDateTime } from '@/lib/format'
import { formatPrice } from '@/lib/products'
import { listAddresses, listWishlist } from '@/lib/server/account'
import { getCurrentUser } from '@/lib/server/auth'
import { listConsentsForUser } from '@/lib/server/consent'
import { listOrdersForUser } from '@/lib/server/orders'
import { listTicketsForUser } from '@/lib/server/support'
import { SUPPORT_TOPICS, TICKET_STATUS_LABELS } from '@/lib/support-shared'
import StatusPill from '@/components/StatusPill'
import AccountShell, { AccountSection } from './AccountShell'
import AddressBook from './AddressBook'
import ProfileForm from './ProfileForm'
import WishlistGrid from './WishlistGrid'

export const metadata: Metadata = { title: 'My Account' }
export const dynamic = 'force-dynamic'

const TABS: AccountSection[] = ['profile', 'orders', 'addresses', 'wishlist', 'support', 'privacy']

export default function AccountPage({ searchParams }: { searchParams: { tab?: string } }) {
  const user = getCurrentUser()
  if (!user) redirect('/auth?next=/account')

  const tab = TABS.find(t => t === searchParams.tab) ?? 'profile'

  return (
    <AccountShell user={user} active={tab}>
      {tab === 'profile' && (
        <Section title="Profile" description="Your name and contact number appear on orders you place.">
          <ProfileForm user={user} />
        </Section>
      )}
      {tab === 'orders' && <OrdersSection userId={user.id} />}
      {tab === 'addresses' && (
        <Section title="Saved Addresses" description="Choose one of these at checkout instead of typing it again.">
          <AddressBook addresses={listAddresses(user.id)} />
        </Section>
      )}
      {tab === 'wishlist' && (
        <Section title="Wishlist" description="Products you have saved for later.">
          <WishlistGrid products={listWishlist(user.id)} />
        </Section>
      )}
      {tab === 'support' && <SupportSection userId={user.id} />}
      {tab === 'privacy' && <ConsentSection userId={user.id} />}
    </AccountShell>
  )
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby="section-heading">
      <h2 id="section-heading" className="font-display text-3xl text-ink">{title}</h2>
      <p className="text-sm text-mist font-sans mt-1 mb-6">{description}</p>
      {children}
    </section>
  )
}

function OrdersSection({ userId }: { userId: number }) {
  const orders = listOrdersForUser(userId)
  return (
    <Section title="Orders" description="Every order you have placed, newest first.">
      {orders.length === 0 ? (
        <div className="border border-dashed border-sand rounded-sm p-10 text-center bg-parchment/40">
          <p className="font-display text-2xl text-mist">No orders yet</p>
          <Link href="/categories" className="inline-block mt-5 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
            Start Shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map(o => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex flex-wrap items-center justify-between gap-3 bg-parchment border border-sand rounded-sm p-4 hover:border-gold transition-colors"
              >
                <div>
                  <p className="font-mono text-sm text-ink">{o.id}</p>
                  <p className="text-xs text-mist font-sans">
                    {formatDateTime(o.createdAt)} · {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={o.status} />
                  <p className="font-display text-xl text-ink">{formatPrice(o.total)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

function SupportSection({ userId }: { userId: number }) {
  const tickets = listTicketsForUser(userId)
  const topicLabel = (value: string) => SUPPORT_TOPICS.find(t => t.value === value)?.label ?? value
  return (
    <Section title="Support Tickets" description="Messages you sent while signed in, and our replies.">
      {tickets.length === 0 ? (
        <p className="text-sm text-mist font-sans">
          No tickets yet. Need help? <Link href="/contact" className="text-sienna underline">Contact us</Link>.
        </p>
      ) : (
        <ul className="space-y-3">
          {tickets.map(t => (
            <li key={t.id} className="bg-parchment border border-sand rounded-sm p-4">
              <div className="flex flex-wrap items-center gap-3">
                <p className="font-mono text-sm text-ink">{t.id}</p>
                <StatusPill tone={t.status === 'resolved' ? 'good' : 'waiting'}>{TICKET_STATUS_LABELS[t.status]}</StatusPill>
                <span className="text-xs text-mist font-sans">{topicLabel(t.topic)} · {formatDateTime(t.createdAt)}</span>
              </div>
              <p className="text-sm font-sans text-ink mt-2 whitespace-pre-line line-clamp-3">{t.message}</p>
              {t.status === 'resolved' && t.adminNote && (
                <p className="text-sm font-sans text-canopy mt-2"><span className="text-xs uppercase tracking-widest">Resolution:</span> {t.adminNote}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

const POLICY_LABELS: Record<string, string> = { terms: 'Terms & Conditions', privacy: 'Privacy Policy' }

const CONTEXT_LABELS: Record<string, string> = {
  registration: 'Account registration',
  checkout: 'Checkout',
  'vendor-application': 'Vendor application',
}

function ConsentSection({ userId }: { userId: number }) {
  const consents = listConsentsForUser(userId)
  return (
    <Section
      title="Consent Records"
      description="Stored on our server each time you accept a policy, as evidence of what you agreed to and when."
    >
      {consents.length === 0 ? (
        <p className="text-sm text-mist font-sans">No consent records yet.</p>
      ) : (
        <div className="overflow-x-auto bg-parchment border border-sand rounded-sm p-4">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="text-left text-mist uppercase tracking-widest border-b border-sand">
                <th className="py-2 pr-4 font-normal">Policy</th>
                <th className="py-2 pr-4 font-normal">Version</th>
                <th className="py-2 pr-4 font-normal">Given at</th>
                <th className="py-2 font-normal">Accepted</th>
              </tr>
            </thead>
            <tbody>
              {consents.map(c => (
                <tr key={c.id} className="border-b border-sand/60 text-ink">
                  <td className="py-2 pr-4">{POLICY_LABELS[c.policy] ?? c.policy}</td>
                  <td className="py-2 pr-4 font-mono">{c.policyVersion}</td>
                  <td className="py-2 pr-4">{CONTEXT_LABELS[c.context] ?? c.context}</td>
                  <td className="py-2">{formatDateTime(c.acceptedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  )
}
