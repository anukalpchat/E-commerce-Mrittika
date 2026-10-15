import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { formatDate, formatGrams, formatLitres } from '@/lib/format'
import { formatPrice } from '@/lib/products'
import { getCurrentUser } from '@/lib/server/auth'
import { computeImpactForUser } from '@/lib/server/orders'
import AccountShell from '../AccountShell'

export const metadata: Metadata = { title: 'My Impact' }
export const dynamic = 'force-dynamic'

export default function ImpactPage() {
  const user = getCurrentUser()
  if (!user) redirect('/auth?next=/account/impact')

  const impact = computeImpactForUser(user.id)

  return (
    <AccountShell user={user} active="impact">
      <section aria-labelledby="impact-heading">
        <h2 id="impact-heading" className="font-display text-3xl text-ink">My Impact</h2>
        <p className="text-sm text-mist font-sans mt-1 mb-6">
          What your paid orders on Mrittika have saved compared with conventional alternatives.
        </p>

        {impact.paidOrders === 0 ? (
          <div className="border border-dashed border-sand rounded-sm p-10 text-center bg-parchment/40">
            <p className="font-display text-2xl text-mist">Your impact starts with your first order</p>
            <p className="text-sm text-mist font-sans mt-2 max-w-md mx-auto">
              Each product carries estimates for plastic avoided, water saved and waste diverted. Once an order is paid,
              its numbers add up here.
            </p>
            <Link href="/categories" className="inline-block mt-5 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
              Shop Sustainable Goods
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <HeroTile label="Plastic avoided" value={formatGrams(impact.plasticAvoidedG)} />
              <HeroTile label="Water saved" value={formatLitres(impact.waterSavedL)} />
              <HeroTile label="Waste diverted" value={formatGrams(impact.wasteDivertedG)} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SmallTile label="Paid orders" value={String(impact.paidOrders)} />
              <SmallTile label="Items bought" value={String(impact.itemsBought)} />
              <SmallTile label="Vendors supported" value={String(impact.vendorsSupported)} />
              <SmallTile label="Spent with makers" value={formatPrice(impact.amountSpent)} />
            </div>

            <ImpactTable
              caption="By category"
              firstColumn="Category"
              rows={impact.byCategory.map(c => ({ key: c.category, label: c.category, ...c }))}
            />

            <ImpactTable
              caption="By order"
              firstColumn="Order"
              rows={impact.byOrder.map(o => ({
                key: o.id,
                label: (
                  <Link href={`/orders/${o.id}`} className="font-mono hover:text-sienna">
                    {o.id}
                  </Link>
                ),
                sublabel: formatDate(o.createdAt),
                ...o,
              }))}
            />
          </div>
        )}

        <p className="mt-8 text-xs text-mist font-sans leading-relaxed border-t border-sand pt-4 max-w-2xl">
          <strong className="text-ink">These are indicative estimates, not measurements.</strong> Per-product figures
          come from the vendor&apos;s own product claims where stated (for example “saves ~8,000 litres of water”) and
          otherwise from rough comparisons with the conventional product. Only paid orders are counted. See the{' '}
          <Link href="/disclaimer" className="text-sienna underline">Disclaimer</Link>.
        </p>
      </section>
    </AccountShell>
  )
}

function HeroTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-forest text-vellum rounded-sm p-6">
      <p className="text-xs font-sans uppercase tracking-widest text-sand">{label}</p>
      <p className="font-display text-5xl text-gold mt-2 leading-none">{value}</p>
      <p className="text-[11px] font-sans text-sand/70 mt-3">Estimated</p>
    </div>
  )
}

function SmallTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-parchment border border-sand rounded-sm p-4">
      <p className="text-xs font-sans uppercase tracking-widest text-mist">{label}</p>
      <p className="font-display text-3xl text-ink mt-1">{value}</p>
    </div>
  )
}

interface ImpactRow {
  key: string
  label: React.ReactNode
  sublabel?: string
  items: number
  plasticAvoidedG: number
  waterSavedL: number
  wasteDivertedG: number
}

function ImpactTable({ caption, firstColumn, rows }: { caption: string; firstColumn: string; rows: ImpactRow[] }) {
  return (
    <div className="bg-parchment border border-sand rounded-sm p-5 overflow-x-auto">
      <table className="w-full text-sm font-sans">
        <caption className="text-left font-display text-xl text-ink mb-3">{caption}</caption>
        <thead>
          <tr className="text-left text-xs text-mist uppercase tracking-widest border-b border-sand">
            <th scope="col" className="py-2 pr-4 font-normal">{firstColumn}</th>
            <th scope="col" className="py-2 pr-4 font-normal text-right">Items</th>
            <th scope="col" className="py-2 pr-4 font-normal text-right">Plastic avoided</th>
            <th scope="col" className="py-2 pr-4 font-normal text-right">Water saved</th>
            <th scope="col" className="py-2 font-normal text-right">Waste diverted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.key} className="border-b border-sand/60 text-ink">
              <th scope="row" className="py-2 pr-4 font-normal text-left">
                {r.label}
                {r.sublabel && <div className="text-xs text-mist">{r.sublabel}</div>}
              </th>
              <td className="py-2 pr-4 text-right tabular-nums">{r.items}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{r.plasticAvoidedG ? formatGrams(r.plasticAvoidedG) : '—'}</td>
              <td className="py-2 pr-4 text-right tabular-nums">{r.waterSavedL ? formatLitres(r.waterSavedL) : '—'}</td>
              <td className="py-2 text-right tabular-nums">{r.wasteDivertedG ? formatGrams(r.wasteDivertedG) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
