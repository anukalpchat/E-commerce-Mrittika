import type { Metadata } from 'next'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { inputClass } from '@/components/FormField'
import type { Category } from '@/lib/products'
import { ImpactFilter, searchProducts, SearchSort } from '@/lib/server/catalog'
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '@/lib/vendor-shared'

export const metadata: Metadata = { title: 'Search & Shop by Impact' }
export const dynamic = 'force-dynamic'

const IMPACTS: { value: ImpactFilter; label: string; text: string }[] = [
  { value: 'plastic', label: 'Avoids plastic', text: 'Replaces single-use or plastic products' },
  { value: 'water', label: 'Saves water', text: 'Uses far less water than the usual alternative' },
  { value: 'waste', label: 'Diverts waste', text: 'Made from upcycled or reclaimed material' },
]

const SCORE_OPTIONS = [
  { value: 0, label: 'Any score' },
  { value: 75, label: '75+ (Strong)' },
  { value: 90, label: '90+ (Exemplary)' },
]

const SORTS: { value: SearchSort; label: string }[] = [
  { value: 'relevance', label: 'Best match' },
  { value: 'score', label: 'Highest score' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

interface Params {
  q?: string
  cat?: string
  impact?: string
  min?: string
  sort?: string
}

function parse(params: Params) {
  const category = CATEGORY_OPTIONS.find(o => o.value === params.cat)?.value ?? null
  const impact = IMPACTS.find(i => i.value === params.impact)?.value ?? null
  const minScore = SCORE_OPTIONS.find(s => String(s.value) === params.min)?.value ?? 0
  const query = (params.q ?? '').trim().slice(0, 100)
  const sort = SORTS.find(s => s.value === params.sort)?.value ?? (query ? 'relevance' : 'score')
  return { query, category, impact, minScore, sort }
}

/** Builds a /search URL from the current filters with some of them changed or removed. */
function href(current: ReturnType<typeof parse>, change: Partial<Record<'q' | 'cat' | 'impact' | 'min' | 'sort', string | null>>): string {
  const values: Record<string, string | null> = {
    q: current.query || null,
    cat: current.category,
    impact: current.impact,
    min: current.minScore ? String(current.minScore) : null,
    sort: current.sort === 'relevance' || current.sort === 'score' ? null : current.sort,
    ...change,
  }
  const qs = new URLSearchParams(Object.entries(values).filter((e): e is [string, string] => !!e[1]))
  const s = qs.toString()
  return s ? `/search?${s}` : '/search'
}

export default function SearchPage({ searchParams }: { searchParams: Params }) {
  const current = parse(searchParams)
  const results = searchProducts(current)

  const chips = [
    current.query && { label: `“${current.query}”`, remove: href(current, { q: null }) },
    current.category && { label: CATEGORY_LABELS[current.category as Category], remove: href(current, { cat: null }) },
    current.impact && { label: IMPACTS.find(i => i.value === current.impact)!.label, remove: href(current, { impact: null }) },
    current.minScore > 0 && { label: `Score ${current.minScore}+`, remove: href(current, { min: null }) },
  ].filter((c): c is { label: string; remove: string } => !!c)

  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-2">Search</p>
          <h1 className="font-display text-4xl text-ink">Find products by what they do for the planet</h1>
          <form action="/search" method="get" role="search" className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <label htmlFor="q" className="sr-only">Search products</label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={current.query}
              placeholder="Try “bamboo”, “GOTS”, “Kerala” or “plastic-free”"
              className={`${inputClass(false)} !py-3 flex-1`}
            />
            {current.category && <input type="hidden" name="cat" value={current.category} />}
            {current.impact && <input type="hidden" name="impact" value={current.impact} />}
            {current.minScore > 0 && <input type="hidden" name="min" value={current.minScore} />}
            <button type="submit" className="font-sans text-sm uppercase tracking-widest bg-gold text-forest px-8 py-3 hover:bg-sand transition-colors">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0 space-y-6" aria-label="Filters">
          <FilterGroup title="Shop by impact">
            {IMPACTS.map(i => (
              <FilterLink key={i.value} active={current.impact === i.value} href={href(current, { impact: current.impact === i.value ? null : i.value })}>
                <span className="block">{i.label}</span>
                <span className="block text-[11px] opacity-75">{i.text}</span>
              </FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup title="Category">
            <FilterLink active={!current.category} href={href(current, { cat: null })}>All categories</FilterLink>
            {CATEGORY_OPTIONS.map(c => (
              <FilterLink key={c.value} active={current.category === c.value} href={href(current, { cat: c.value })}>{c.label}</FilterLink>
            ))}
          </FilterGroup>
          <FilterGroup title="Sustainability score">
            {SCORE_OPTIONS.map(s => (
              <FilterLink key={s.value} active={current.minScore === s.value} href={href(current, { min: s.value ? String(s.value) : null })}>{s.label}</FilterLink>
            ))}
          </FilterGroup>
        </aside>

        <section className="flex-1 min-w-0" aria-label="Results">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-sm text-mist font-sans" role="status">
              {results.length} {results.length === 1 ? 'product' : 'products'}
            </p>
            <nav aria-label="Sort" className="flex flex-wrap gap-1 text-xs font-sans">
              {SORTS.filter(s => s.value !== 'relevance' || current.query).map(s => (
                <Link
                  key={s.value}
                  href={href(current, { sort: s.value })}
                  aria-current={current.sort === s.value ? 'true' : undefined}
                  className={`px-3 py-1.5 rounded-sm border ${current.sort === s.value ? 'bg-forest text-vellum border-forest' : 'border-sand text-mist hover:text-ink'}`}
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          </div>

          {chips.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-5" aria-label="Active filters">
              {chips.map(c => (
                <li key={c.label}>
                  <Link href={c.remove} className="inline-flex items-center gap-2 text-xs font-sans border border-gold/60 text-ink bg-gold/10 rounded-full px-3 py-1 hover:bg-gold/20">
                    {c.label} <span aria-hidden="true">✕</span><span className="sr-only">Remove filter</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/search" className="text-xs font-sans text-sienna underline underline-offset-2 px-2 py-1 inline-block">Clear all</Link>
              </li>
            </ul>
          )}

          {results.length === 0 ? (
            <div className="border border-dashed border-sand rounded-sm p-10 text-center bg-parchment/40">
              <p className="font-display text-2xl text-mist">No products match</p>
              <p className="text-sm text-mist font-sans mt-2">Try fewer words, or remove a filter.</p>
              <Link href="/search" className="inline-block mt-5 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
                Show everything
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-parchment border border-sand rounded-sm p-4">
      <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function FilterLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={`block text-sm font-sans px-2 py-1.5 rounded-sm transition-colors ${active ? 'bg-forest text-vellum' : 'text-mist hover:text-ink'}`}
    >
      {children}
    </Link>
  )
}
