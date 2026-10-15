'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/products'
import { formatPrice } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import ProductCard from '@/components/ProductCard'
import WishlistButton from '@/components/WishlistButton'

interface Props {
  product: Product
  basePrice: number
  gstAmount: number
  related: Product[]
  vendorVerified: boolean
}

export default function ProductDetailClient({ product, basePrice, gstAmount, related, vendorVerified }: Props) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const scoreColor = product.sustainabilityScore >= 90 ? 'text-canopy' : product.sustainabilityScore >= 70 ? 'text-gold' : 'text-sienna'
  const scoreBg = product.sustainabilityScore >= 90 ? 'bg-canopy' : product.sustainabilityScore >= 70 ? 'bg-gold' : 'bg-sienna'

  return (
    <main className="min-h-screen bg-vellum">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-xs font-sans text-mist">
          <Link href="/" className="hover:text-gold">Home</Link>
          <span>›</span>
          <Link href="/categories" className="hover:text-gold">Shop</Link>
          <span>›</span>
          <Link href={`/categories?cat=${product.category}`} className="hover:text-gold">{product.categoryLabel}</Link>
          <span>›</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      {/* Product */}
      <div className="max-w-7xl mx-auto px-6 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div className={`${product.imageColor} rounded-sm aspect-square relative overflow-hidden`}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
            {/* Score badge */}
            <div className="absolute top-4 right-4 z-10">
              <div className={`${scoreBg} text-white rounded-full w-16 h-16 flex flex-col items-center justify-center shadow-md`}>
                <span className="font-display text-xl leading-none">{product.sustainabilityScore}</span>
                <span className="font-sans text-[9px] leading-none mt-0.5">/ 100</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-gold font-sans text-xs uppercase tracking-widest mb-1">{product.categoryLabel}</p>
              <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">{product.name}</h1>
              <p className="text-mist font-sans text-sm mt-1">
                by <span className="text-ink">{product.vendor}</span> · {product.vendorLocation}
                {vendorVerified && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-canopy border border-canopy/40 bg-canopy/5 px-1.5 py-0.5 rounded-sm align-middle" title="This vendor's application and documents were reviewed by Mrittika">
                    ✓ Verified vendor
                  </span>
                )}
              </p>
            </div>

            <p className="text-mist font-sans text-sm leading-relaxed">{product.shortDescription}</p>

            {/* Price */}
            <div className="border border-sand rounded-sm p-4 bg-parchment">
              <div className="flex items-baseline gap-3">
                <p className="font-display text-3xl text-ink">{formatPrice(product.price)}</p>
                <p className="text-xs text-mist font-sans">incl. GST</p>
              </div>
              <div className="mt-2 text-xs text-mist font-sans space-y-0.5">
                <p>Base price: {formatPrice(basePrice)}</p>
                <p>GST ({product.gstRate}%): {formatPrice(gstAmount)}</p>
              </div>
            </div>

            {/* Add to cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-sand rounded-sm">
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-3 py-2 text-mist hover:text-ink font-sans text-lg leading-none"
                >−</button>
                <span className="px-4 font-sans text-sm text-ink">{qty}</span>
                <button
                  onClick={() => setQty(q => Math.min(product.stockCount, q + 1))}
                  className="px-3 py-2 text-mist hover:text-ink font-sans text-lg leading-none"
                >+</button>
              </div>
              <button
                onClick={handleAdd}
                disabled={!product.inStock}
                className={`flex-1 font-sans text-sm uppercase tracking-widest py-2.5 px-6 transition-colors ${
                  added
                    ? 'bg-canopy text-vellum'
                    : 'bg-gold text-forest hover:bg-sand'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {added ? '✓ Added to Cart' : 'Add to Cart'}
              </button>
              <Link
                href="/cart"
                className="font-sans text-sm uppercase tracking-widest py-2.5 px-5 border border-gold/60 text-gold hover:bg-gold hover:text-forest transition-colors"
              >
                View Cart
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {product.inStock ? (
                <p className="text-xs font-sans text-canopy">✓ In stock · {product.stockCount} units remaining</p>
              ) : (
                <p className="text-xs font-sans text-sienna">✗ Out of stock</p>
              )}
              <WishlistButton slug={product.slug} />
            </div>
            <p className="text-xs font-sans text-mist">
              Sold by <span className="text-ink">{product.vendor}</span>, {product.vendorLocation} · Country of origin: <span className="text-ink">{product.countryOfOrigin ?? 'India'}</span>
            </p>

            {/* Certifications */}
            <div>
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {product.certifications.map(c => (
                  <span key={c} className="text-xs font-sans border border-canopy/40 text-canopy bg-canopy/5 px-2.5 py-1 rounded-sm">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs — description + sustainability */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Description */}
          <div className="bg-parchment border border-sand rounded-sm p-6">
            <h2 className="font-display text-2xl text-ink mb-4">About this product</h2>
            <p className="text-sm text-mist font-sans leading-relaxed">{product.description}</p>
            <div className="mt-5">
              <p className="font-sans text-xs uppercase tracking-widest text-gold mb-2">Materials</p>
              <ul className="space-y-1">
                {product.materials.map(m => (
                  <li key={m} className="text-xs font-sans text-mist flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-canopy rounded-full shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sustainability Score */}
          <div className="bg-parchment border border-sand rounded-sm p-6">
            <h2 className="font-display text-2xl text-ink mb-4">Sustainability Score</h2>
            {/* Score bar */}
            <div className="flex items-end gap-4 mb-5">
              <p className={`font-display text-6xl ${scoreColor}`}>{product.sustainabilityScore}</p>
              <p className="text-mist font-sans text-sm mb-2">/ 100</p>
            </div>
            <div className="w-full bg-sand/40 rounded-full h-2 mb-6">
              <div
                className={`${scoreBg} h-2 rounded-full transition-all`}
                style={{ width: `${product.sustainabilityScore}%` }}
              />
            </div>
            <div className="space-y-3">
              {[
                { label: 'Materials & Sourcing', score: Math.min(100, product.sustainabilityScore + 3) },
                { label: 'Manufacturing Process', score: Math.max(60, product.sustainabilityScore - 5) },
                { label: 'Packaging', score: Math.min(100, product.sustainabilityScore + 5) },
                { label: 'Social Impact', score: Math.max(70, product.sustainabilityScore - 2) },
              ].map(c => (
                <div key={c.label}>
                  <div className="flex justify-between text-xs font-sans text-mist mb-1">
                    <span>{c.label}</span>
                    <span className="text-ink">{c.score}/100</span>
                  </div>
                  <div className="w-full bg-sand/40 rounded-full h-1.5">
                    <div className={`${scoreBg} h-1.5 rounded-full`} style={{ width: `${c.score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-6 flex flex-wrap gap-2">
          {product.tags.map(t => (
            <span key={t} className="text-xs font-sans bg-parchment border border-sand text-mist px-3 py-1 rounded-full">
              #{t}
            </span>
          ))}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="font-display text-2xl text-ink mb-6">More from {product.categoryLabel}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {related.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
