import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-vellum flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-lg">
        <p className="font-display text-8xl text-gold/60 leading-none">404</p>
        <h1 className="font-display text-4xl text-ink mt-4">This page has gone back to the soil</h1>
        <p className="text-sm text-mist font-sans mt-3">
          The link may be old, or the product may no longer be listed. Try searching, or start from the shop.
        </p>
        <form action="/search" method="get" role="search" className="mt-6 flex gap-2 max-w-sm mx-auto">
          <label htmlFor="nf-q" className="sr-only">Search products</label>
          <input id="nf-q" name="q" type="search" placeholder="Search products" className="flex-1 text-sm font-sans border border-sand rounded-sm px-3 py-2 bg-parchment text-ink focus:outline-none focus:border-gold" />
          <button type="submit" className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-4 py-2 hover:bg-sand">Search</button>
        </form>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <Link href="/" className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold">Home</Link>
          <Link href="/categories" className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold">Shop</Link>
          <Link href="/contact" className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold">Get help</Link>
        </div>
      </div>
    </main>
  )
}
