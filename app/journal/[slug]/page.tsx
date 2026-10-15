import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProductCard from '@/components/ProductCard'
import { formatDate } from '@/lib/format'
import { ARTICLES, Block, getArticle } from '@/lib/journal'
import type { Product } from '@/lib/products'
import { getActiveProduct } from '@/lib/server/catalog'

export const dynamic = 'force-dynamic'

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticle(params.slug)
  return { title: article ? article.title : 'Article not found', description: article?.excerpt }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug)
  if (!article) notFound()
  const more = ARTICLES.filter(a => a.slug !== article.slug).slice(0, 2)

  return (
    <main className="min-h-screen bg-vellum">
      <article className="max-w-3xl mx-auto px-6 py-12">
        <nav aria-label="Breadcrumb" className="text-xs font-sans text-mist mb-6">
          <Link href="/journal" className="hover:text-sienna">Journal</Link> <span aria-hidden="true">›</span> {article.tag}
        </nav>
        <h1 className="font-display text-4xl md:text-5xl text-ink leading-tight">{article.title}</h1>
        <p className="text-sm text-mist font-sans mt-4">
          By the Mrittika team · {formatDate(article.publishedAt)} · {article.readMinutes} min read
        </p>
        <p className="font-display text-xl text-ink mt-8 leading-relaxed">{article.excerpt}</p>
        <div className="mt-8 space-y-5">
          {article.body.map((block, i) => <BlockView key={i} block={block} />)}
        </div>
      </article>

      <section aria-labelledby="more-heading" className="border-t border-sand bg-parchment/60">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h2 id="more-heading" className="font-display text-2xl text-ink mb-4">More from the journal</h2>
          <ul className="space-y-3">
            {more.map(a => (
              <li key={a.slug}>
                <Link href={`/journal/${a.slug}`} className="font-display text-lg text-ink hover:text-sienna">{a.title} →</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}

function BlockView({ block }: { block: Block }) {
  if (block.type === 'h2') return <h2 className="font-display text-2xl text-ink pt-4">{block.text}</h2>
  if (block.type === 'p') return <p className="text-base font-sans text-ink/90 leading-relaxed">{block.text}</p>
  if (block.type === 'ul') {
    return (
      <ul className="list-disc pl-6 space-y-2 text-base font-sans text-ink/90 leading-relaxed">
        {block.items.map(item => <li key={item}>{item}</li>)}
      </ul>
    )
  }
  // Products that were hidden or removed are skipped rather than breaking the article.
  const products = block.slugs.map(getActiveProduct).filter((p): p is Product => p !== undefined)
  if (products.length === 0) return null
  return (
    <div className="not-prose py-4">
      <p className="text-xs font-sans uppercase tracking-widest text-gold mb-3">Shop this article</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {products.map(p => <ProductCard key={p.slug} product={p} />)}
      </div>
    </div>
  )
}
