import type { Metadata } from 'next'
import Link from 'next/link'
import { getCatalogueStats } from '@/lib/server/catalog'
import { DEFAULT_COMMISSION_RATE } from '@/lib/vendor-shared'

export const metadata: Metadata = { title: 'About Us' }
export const dynamic = 'force-dynamic'

const DIFFERENCES = [
  {
    title: 'A score for every product',
    text: 'Sustainable marketplaces usually rely on badges and vendor descriptions. We review each listing and score it on the same four pillars, so a 92 means the same thing for soap as it does for a saree.',
  },
  {
    title: 'Your own impact, tracked',
    text: 'Every paid order adds to a personal dashboard of plastic avoided, water saved and waste diverted, so you can see what your choices add up to over time.',
  },
  {
    title: 'Verified makers only',
    text: 'Vendors apply with their GSTIN and their practices, and are approved by a person before they can list anything. Approved vendors carry a verified badge.',
  },
]

const VALUES = [
  { title: 'Proof over promises', text: 'Claims need documentation. If a vendor cannot back it up, it does not go on the listing.' },
  { title: 'Fair to makers', text: `A flat ${DEFAULT_COMMISSION_RATE}% commission, no listing fees, and vendors keep ownership of their brand and content.` },
  { title: 'Honest about limits', text: 'Scores and impact numbers are estimates, and we say so wherever they appear.' },
  { title: 'No dark patterns', text: 'No pre-ticked consent boxes, fake timers or hidden charges. You agree to things by choosing to.' },
]

const TEAM = [
  { name: 'Soham Sawant', id: 'A052' },
  { name: 'Anukalp Chaturvedi', id: 'A007' },
  { name: 'Shubham Murkunde', id: 'F025' },
]

export default function AboutPage() {
  const stats = getCatalogueStats()

  return (
    <main className="min-h-screen bg-vellum">
      <section className="bg-forest text-vellum">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-4">About Mrittika</p>
          <h1 className="font-display text-4xl md:text-6xl font-light max-w-3xl leading-tight">
            <span className="italic text-gold">Mrittika</span> means earth, or soil.
          </h1>
          <p className="text-sand font-sans text-base mt-5 max-w-2xl leading-relaxed">
            We are a marketplace for goods that are kinder to it — made by Indian artisans, farmers and small businesses, and checked
            before they reach you.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-14 space-y-16">
        <section aria-labelledby="mission-heading" className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 id="mission-heading" className="font-display text-3xl text-ink">Why we exist</h2>
            <p className="text-sm text-mist font-sans mt-3 leading-relaxed">
              Words like “eco-friendly”, “natural” and “organic” sell, so they are everywhere — and most shoppers have no way to tell a
              genuine claim from a marketing one. That gap hurts buyers who want to choose well, and it hurts the makers doing the hard,
              more expensive work of producing responsibly.
            </p>
            <p className="text-sm text-mist font-sans mt-3 leading-relaxed">
              Mrittika closes that gap by reviewing vendors and products against a published method, and by showing each buyer what
              their purchases actually add up to.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 self-start">
            <Stat value={String(stats.liveProducts)} label="Products, each scored" />
            <Stat value={String(stats.verifiedVendors)} label="Verified vendors" />
            <Stat value={`${stats.averageScore}`} label="Average score / 100" />
          </div>
        </section>

        <section aria-labelledby="different-heading">
          <h2 id="different-heading" className="font-display text-3xl text-ink mb-6">What makes us different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DIFFERENCES.map(d => (
              <div key={d.title} className="bg-parchment border border-sand rounded-sm p-6">
                <h3 className="font-display text-2xl text-ink">{d.title}</h3>
                <p className="text-sm text-mist font-sans mt-2 leading-relaxed">{d.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="model-heading" className="bg-parchment border border-sand rounded-sm p-8">
          <h2 id="model-heading" className="font-display text-3xl text-ink">How the marketplace works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 text-sm font-sans">
            <div>
              <p className="text-xs text-gold uppercase tracking-widest mb-1">Vendors own the stock</p>
              <p className="text-ink leading-relaxed">Each vendor lists, prices and ships its own products. Mrittika does not hold inventory.</p>
            </div>
            <div>
              <p className="text-xs text-gold uppercase tracking-widest mb-1">We review and connect</p>
              <p className="text-ink leading-relaxed">We vet vendors, score products, run checkout and handle customer support and grievances.</p>
            </div>
            <div>
              <p className="text-xs text-gold uppercase tracking-widest mb-1">Commission, not markup</p>
              <p className="text-ink leading-relaxed">We earn a {DEFAULT_COMMISSION_RATE}% commission on each sale; the price you see is the vendor&apos;s price.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="values-heading">
          <h2 id="values-heading" className="font-display text-3xl text-ink mb-6">What we stand by</h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {VALUES.map(v => (
              <div key={v.title} className="border-l-2 border-gold pl-4">
                <dt className="font-display text-xl text-ink">{v.title}</dt>
                <dd className="text-sm text-mist font-sans mt-1">{v.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="team-heading">
          <h2 id="team-heading" className="font-display text-3xl text-ink mb-2">The team</h2>
          <p className="text-sm text-mist font-sans mb-6 max-w-2xl">
            Mrittika was built as the E-Commerce lab project for MBA.Tech (IT), Semester VII. It is a working demonstration, not a
            registered business: payments are simulated and no orders are fulfilled.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEAM.map(m => (
              <li key={m.id} className="bg-parchment border border-sand rounded-sm p-6 flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-forest text-gold font-display text-xl flex items-center justify-center shrink-0" aria-hidden="true">
                  {m.name.split(' ').map(w => w[0]).join('')}
                </span>
                <div>
                  <p className="font-display text-xl text-ink">{m.name}</p>
                  <p className="text-xs text-mist font-sans">Roll no. {m.id}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-4 border-t border-sand pt-8">
          <p className="font-display text-2xl text-ink">Start with something you use every day.</p>
          <div className="flex gap-3">
            <Link href="/categories" className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">Shop</Link>
            <Link href="/sustainability" className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold">How we score</Link>
          </div>
        </section>
      </div>
    </main>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-parchment border border-sand rounded-sm p-4 text-center">
      <p className="font-display text-4xl text-ink">{value}</p>
      <p className="text-[11px] text-mist font-sans uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}
