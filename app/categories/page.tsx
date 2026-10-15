'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { products, categories, type Category } from '@/lib/products'
import ProductCard from '@/components/ProductCard'

function CategoriesContent() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('cat') as Category | null

  const [selectedCat, setSelectedCat] = useState<Category | 'all'>(initialCat ?? 'all')
  const [minScore, setMinScore] = useState(0)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sortBy, setSortBy] = useState<'score' | 'price-asc' | 'price-desc'>('score')

  const filtered = useMemo(() => {
    let list = products.filter(p =>
      (selectedCat === 'all' || p.category === selectedCat) &&
      p.sustainabilityScore >= minScore &&
      p.price <= maxPrice
    )
    if (sortBy === 'score') list = [...list].sort((a, b) => b.sustainabilityScore - a.sustainabilityScore)
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    return list
  }, [selectedCat, minScore, maxPrice, sortBy])

  return (
    <main className="min-h-screen bg-vellum">
      {/* Header */}
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-2">Shop</p>
          <h1 className="font-display text-4xl text-ink">All Products</h1>
          <p className="text-mist font-sans text-sm mt-2">{filtered.length} of {products.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-parchment border border-sand rounded-sm p-5 space-y-6 sticky top-6">
            {/* Category filter */}
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">Category</p>
              <div className="space-y-1.5">
                <button
                  onClick={() => setSelectedCat('all')}
                  className={`w-full text-left text-sm font-sans px-2 py-1 rounded-sm transition-colors ${selectedCat === 'all' ? 'bg-forest text-vellum' : 'text-mist hover:text-ink'}`}
                >
                  All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCat(cat.slug as Category)}
                    className={`w-full text-left text-sm font-sans px-2 py-1 rounded-sm transition-colors ${selectedCat === cat.slug ? 'bg-forest text-vellum' : 'text-mist hover:text-ink'}`}
                  >
                    {cat.label} <span className="text-xs opacity-60">({cat.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Score filter */}
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
                Min Score: <span className="text-ink">{minScore}+</span>
              </p>
              <input
                type="range" min={0} max={95} step={5}
                value={minScore}
                onChange={e => setMinScore(Number(e.target.value))}
                className="w-full accent-canopy"
              />
              <div className="flex justify-between text-xs text-mist mt-1">
                <span>0</span><span>95+</span>
              </div>
            </div>

            {/* Price filter */}
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-3">
                Max Price: <span className="text-ink">₹{maxPrice.toLocaleString('en-IN')}</span>
              </p>
              <input
                type="range" min={200} max={5000} step={100}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-canopy"
              />
              <div className="flex justify-between text-xs text-mist mt-1">
                <span>₹200</span><span>₹5,000</span>
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setSelectedCat('all'); setMinScore(0); setMaxPrice(5000) }}
              className="w-full text-xs font-sans text-mist hover:text-sienna transition-colors"
            >
              Reset filters
            </button>
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-mist font-sans">{filtered.length} products</p>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs font-sans border border-sand bg-parchment text-ink px-3 py-1.5 rounded-sm focus:outline-none focus:border-gold"
            >
              <option value="score">Sort: Highest Score</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-mist/60">No products match your filters.</p>
              <button
                onClick={() => { setSelectedCat('all'); setMinScore(0); setMaxPrice(5000) }}
                className="mt-4 text-xs font-sans text-gold underline"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(p => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-vellum" />}>
      <CategoriesContent />
    </Suspense>
  )
}
