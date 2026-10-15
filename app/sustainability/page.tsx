import type { Metadata } from 'next'
import Link from 'next/link'
import { formatGrams, formatLitres } from '@/lib/format'
import { MINIMUM_LISTING_SCORE, SCORE_BANDS, SCORING_PILLARS } from '@/lib/scoring'
import { getCatalogueStats } from '@/lib/server/catalog'
import { computePlatformImpact } from '@/lib/server/orders'

export const metadata: Metadata = { title: 'Sustainability Guide' }
export const dynamic = 'force-dynamic'

const STEPS = [
  { title: 'Vendor applies', text: 'Businesses apply with their GSTIN and a description of their materials, processes and certifications.' },
  { title: 'We vet the vendor', text: 'Our team checks the application. Only approved vendors can list products, and they carry a verified badge.' },
  { title: 'Each product is reviewed', text: 'Every listing arrives with materials, certifications and per-unit impact claims. A reviewer scores it against the four pillars below.' },
  { title: 'Scores stay honest', text: 'If a vendor later changes what a product claims — materials, photo, impact figures — it leaves the shop until it is reviewed again.' },
]

const CERTIFICATIONS = [
  { name: 'GOTS', text: 'Global Organic Textile Standard: textiles made with certified organic fibre, with environmental and social criteria through processing.' },
  { name: 'GRS', text: 'Global Recycled Standard: verifies recycled content and tracks it through the supply chain.' },
  { name: 'FSC', text: 'Forest Stewardship Council: wood and bamboo from responsibly managed forests.' },
  { name: 'India Organic', text: "India's national organic certification under the National Programme for Organic Production (NPOP)." },
  { name: 'PGS-India', text: 'Participatory Guarantee System: peer-reviewed organic certification designed for smallholder farmer groups.' },
  { name: 'Ecocert COSMOS', text: 'International standard for organic and natural cosmetics, covering ingredients and manufacturing.' },
  { name: 'GI tag', text: 'Geographical Indication: the product comes from a specific region whose know-how gives it its qualities (e.g. Khurja pottery, Kolhapuri chappals).' },
  { name: 'Handloom Mark', text: 'Government of India mark certifying that a fabric is genuinely handwoven.' },
  { name: 'KVIC Khadi', text: 'Khadi and Village Industries Commission certification for hand-spun, handwoven khadi.' },
  { name: 'SA8000', text: 'Social accountability standard for decent working conditions in factories.' },
]

export default function SustainabilityPage() {
  const impact = computePlatformImpact()
  const stats = getCatalogueStats()

  return (
    <main className="min-h-screen bg-vellum">
      <section className="bg-forest text-vellum">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-3">Sustainability Guide</p>
          <h1 className="font-display text-4xl md:text-5xl font-light max-w-3xl leading-tight">
            Every product on Mrittika is reviewed and scored before you can buy it.
          </h1>
          <p className="text-sand font-sans text-sm mt-4 max-w-2xl leading-relaxed">
            “Eco-friendly” is easy to print on a label. Our score shows how a product was made, scored against the same method for every
            vendor, so you can compare claims instead of taking them on trust.
          </p>
        </div>
      </section>

      <section aria-labelledby="impact-heading" className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <h2 id="impact-heading" className="text-xs font-sans text-gold uppercase tracking-widest mb-4">Our impact so far</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <Stat label="Plastic avoided" value={formatGrams(impact.plasticAvoidedG)} estimate />
            <Stat label="Water saved" value={formatLitres(impact.waterSavedL)} estimate />
            <Stat label="Waste diverted" value={formatGrams(impact.wasteDivertedG)} estimate />
            <Stat label="Paid orders" value={String(impact.paidOrders)} />
            <Stat label="Live products" value={String(stats.liveProducts)} />
            <Stat label="Verified vendors" value={String(stats.verifiedVendors)} />
            <Stat label="Average score" value={`${stats.averageScore}/100`} />
          </div>
          <p className="text-xs text-mist font-sans mt-4">
            Live totals across all customers&apos; paid orders. Impact figures are estimates built from reviewed per-product claims.{' '}
            <Link href="/account/impact" className="text-sienna underline">See your own impact →</Link>
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-14 space-y-16">
        <section aria-labelledby="how-heading">
          <h2 id="how-heading" className="font-display text-3xl text-ink mb-6">How scoring works</h2>
          <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-parchment border border-sand rounded-sm p-5">
                <p className="font-display text-3xl text-gold">{i + 1}</p>
                <p className="font-display text-xl text-ink mt-1">{s.title}</p>
                <p className="text-sm text-mist font-sans mt-2 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="pillars-heading">
          <h2 id="pillars-heading" className="font-display text-3xl text-ink mb-2">The four pillars</h2>
          <p className="text-sm text-mist font-sans mb-6 max-w-2xl">
            Reviewers weigh four areas. The weights add up to 100 and reflect where most of a product&apos;s footprint usually sits.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SCORING_PILLARS.map(p => (
              <div key={p.name} className="bg-parchment border border-sand rounded-sm p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl text-ink">{p.name}</h3>
                  <p className="font-display text-3xl text-canopy">{p.weight}%</p>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {p.looksAt.map(item => (
                    <li key={item} className="text-sm text-mist font-sans flex gap-2">
                      <span className="w-1.5 h-1.5 bg-canopy rounded-full shrink-0 mt-2" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="bands-heading">
          <h2 id="bands-heading" className="font-display text-3xl text-ink mb-6">Reading a score</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {SCORE_BANDS.map((b, i) => (
              <div key={b.label} className="bg-parchment border border-sand rounded-sm p-5">
                <p className="font-mono text-sm text-ink">{b.min}–{i === 0 ? 100 : SCORE_BANDS[i - 1].min - 1}</p>
                <p className="font-display text-2xl text-ink mt-1">{b.label}</p>
                <p className="text-sm text-mist font-sans mt-2">{b.text}</p>
              </div>
            ))}
            <div className="bg-vellum border border-dashed border-sand rounded-sm p-5">
              <p className="font-mono text-sm text-ink">0–{MINIMUM_LISTING_SCORE - 1}</p>
              <p className="font-display text-2xl text-mist mt-1">Not listed</p>
              <p className="text-sm text-mist font-sans mt-2">Products below {MINIMUM_LISTING_SCORE} are sent back to the vendor with feedback.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="certs-heading">
          <h2 id="certs-heading" className="font-display text-3xl text-ink mb-2">Certifications you will see</h2>
          <p className="text-sm text-mist font-sans mb-6 max-w-2xl">
            A certification raises the score of the pillar it covers. We check that the vendor holds it, but the certifying body —
            not Mrittika — sets and audits its standard.
          </p>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
            {CERTIFICATIONS.map(c => (
              <div key={c.name} className="border-b border-sand pb-3">
                <dt className="font-display text-lg text-ink">{c.name}</dt>
                <dd className="text-sm text-mist font-sans mt-0.5">{c.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="vendors-heading" className="bg-parchment border border-sand rounded-sm p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 id="vendors-heading" className="font-display text-3xl text-ink">For vendors</h2>
            <p className="text-sm text-mist font-sans mt-2 leading-relaxed">
              Submit what you can prove. Listings with specific materials, named certifications and realistic impact figures score
              higher and get approved faster.
            </p>
            <Link href="/vendor/register" className="inline-block mt-5 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
              Apply to Sell
            </Link>
          </div>
          <div>
            <p className="text-xs font-sans text-gold uppercase tracking-widest mb-2">Common reasons listings are sent back</p>
            <ul className="space-y-1.5 text-sm text-ink font-sans list-disc pl-5">
              <li>Vague claims such as “eco-friendly” or “natural” with no materials listed</li>
              <li>Certifications named but not held by the vendor or its supplier</li>
              <li>Impact figures far above what the product could plausibly achieve</li>
              <li>Photos that misrepresent the product</li>
            </ul>
            <p className="text-xs text-mist font-sans mt-3">To appeal, edit the listing to address the reviewer&apos;s note; it returns to the review queue.</p>
          </div>
        </section>

        <p className="text-xs text-mist font-sans max-w-3xl leading-relaxed border-t border-sand pt-6">
          Scores are an indicative assessment based on vendor-submitted documentation and Mrittika&apos;s method. They are not an
          independent third-party certification. See the <Link href="/disclaimer#scoring" className="text-sienna underline">Disclaimer</Link>.
        </p>
      </div>
    </main>
  )
}

function Stat({ label, value, estimate }: { label: string; value: string; estimate?: boolean }) {
  return (
    <div className="bg-vellum border border-sand rounded-sm p-4">
      <p className="text-[11px] font-sans uppercase tracking-widest text-mist">{label}</p>
      <p className="font-display text-3xl text-ink mt-1">{value}</p>
      {estimate && <p className="text-[11px] text-mist font-sans">estimated</p>}
    </div>
  )
}
