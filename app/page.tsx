import type { Metadata } from 'next'
import Link from 'next/link'
import { products, categories, formatPrice } from '@/lib/products'
import ProductCard from '@/components/ProductCard'

export const metadata: Metadata = { title: 'Mrittika — Verified Sustainable Goods' }

const featured = products.filter(p => p.sustainabilityScore >= 90).slice(0, 4)

export default function HomePage() {
  return (
    <main className="min-h-screen bg-vellum">
      {/* Hero */}
      <section className="bg-forest text-vellum">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="text-gold font-sans text-xs uppercase tracking-widest mb-4">Verified Sustainable Marketplace</p>
            <h1 className="font-display text-5xl md:text-6xl font-light leading-tight">
              Buy goods that <br />
              <span className="text-gold italic">heal the planet.</span>
            </h1>
            <p className="mt-5 text-sand font-sans text-sm leading-relaxed max-w-md">
              Every product on Mrittika is scored by an independent sustainability engine —
              materials, carbon footprint, social impact — before it reaches your cart.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/categories"
                className="font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/sustainability"
                className="font-sans text-sm uppercase tracking-widest border border-sand/60 text-sand px-6 py-3 hover:border-gold hover:text-gold transition-colors"
              >
                How We Score
              </Link>
            </div>
          </div>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-8 shrink-0">
            {[
              { value: '4,200+', label: 'kg plastic replaced' },
              { value: '86', label: 'verified vendors' },
              { value: '12,500+', label: 'orders delivered' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl text-gold">{s.value}</p>
                <p className="text-sand font-sans text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-ink mb-2">Browse by Category</h2>
        <p className="text-mist font-sans text-sm mb-8">Every category independently scored for sustainability.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              href={`/categories?cat=${cat.slug}`}
              className={`${cat.imageColor} rounded-sm p-6 flex flex-col gap-3 hover:ring-2 hover:ring-gold/60 transition-all`}
            >
              <p className="font-display text-xl text-ink">{cat.label}</p>
              <p className="text-xs text-mist font-sans">{cat.description}</p>
              <p className="text-xs font-sans text-gold mt-auto">{cat.count} products →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-parchment border-y border-sand">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-baseline justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl text-ink">Top Rated</h2>
              <p className="text-mist font-sans text-sm mt-1">Sustainability score 90+ — our most verified picks.</p>
            </div>
            <Link href="/categories" className="text-gold font-sans text-xs uppercase tracking-widest hover:text-canopy transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map(p => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* How Scoring Works */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <h2 className="font-display text-3xl text-ink mb-2 text-center">How Scoring Works</h2>
        <p className="text-mist font-sans text-sm text-center mb-10 max-w-lg mx-auto">
          No self-reporting. Every claim is verified by our review team before a score is published.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Vendor submits docs', desc: 'Certifications, material sourcing, factory audit reports, carbon calculations.' },
            { step: '02', title: 'Independent review', desc: 'Our sustainability analysts review against 24 criteria across materials, process, packaging, and social impact.' },
            { step: '03', title: 'Score published', desc: 'A 0–100 score with criterion-level breakdown is published on every product page.' },
          ].map(s => (
            <div key={s.step} className="border border-sand rounded-sm p-6 bg-parchment/50">
              <p className="font-display text-4xl text-gold/40 mb-3">{s.step}</p>
              <h3 className="font-display text-xl text-ink mb-2">{s.title}</h3>
              <p className="text-xs text-mist font-sans leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All Products */}
      <section className="bg-parchment border-t border-sand">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-display text-3xl text-ink">All Products</h2>
            <p className="text-mist font-sans text-sm">{products.length} verified items</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map(p => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="bg-forest text-vellum">
        <div className="max-w-7xl mx-auto px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-display text-3xl">Sell on Mrittika</h2>
            <p className="text-sand font-sans text-sm mt-2 max-w-md">
              Are you a sustainable brand or artisan collective? Apply to list your products and reach conscious consumers across India.
            </p>
          </div>
          <Link
            href="/vendor/register"
            className="shrink-0 font-sans text-sm uppercase tracking-widest border border-gold text-gold px-7 py-3 hover:bg-gold hover:text-forest transition-colors"
          >
            Apply as Vendor
          </Link>
        </div>
      </section>
    </main>
  )
}
