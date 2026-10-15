import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { ARTICLES } from '@/lib/journal'

export const metadata: Metadata = { title: 'Journal' }

export default function JournalPage() {
  const [featured, ...rest] = [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))

  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-2">Journal</p>
          <h1 className="font-display text-4xl md:text-5xl text-ink">Notes on living lighter</h1>
          <p className="text-sm text-mist font-sans mt-2 max-w-xl">Guides and explainers from the Mrittika team.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        <Link href={`/journal/${featured.slug}`} className="block bg-forest text-vellum rounded-sm p-8 md:p-12 hover:ring-2 hover:ring-gold/60 transition-all">
          <p className="text-xs font-sans uppercase tracking-widest text-gold">{featured.tag} · Latest</p>
          <h2 className="font-display text-3xl md:text-4xl mt-3 max-w-3xl leading-tight">{featured.title}</h2>
          <p className="text-sand font-sans text-sm mt-3 max-w-2xl leading-relaxed">{featured.excerpt}</p>
          <p className="text-xs text-sand/70 font-sans mt-5">{formatDate(featured.publishedAt)} · {featured.readMinutes} min read</p>
        </Link>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rest.map(a => (
            <li key={a.slug}>
              <Link href={`/journal/${a.slug}`} className="block h-full bg-parchment border border-sand rounded-sm p-6 hover:border-gold transition-colors">
                <p className="text-xs font-sans uppercase tracking-widest text-gold">{a.tag}</p>
                <h2 className="font-display text-2xl text-ink mt-2 leading-snug">{a.title}</h2>
                <p className="text-sm text-mist font-sans mt-2 leading-relaxed">{a.excerpt}</p>
                <p className="text-xs text-mist font-sans mt-4">{formatDate(a.publishedAt)} · {a.readMinutes} min read</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
