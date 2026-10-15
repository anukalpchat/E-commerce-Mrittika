'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/products'
import { formatPrice } from '@/lib/products'
import { useCart } from '@/lib/cart-context'
import { useState } from 'react'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col bg-parchment border border-sand hover:border-gold/60 transition-colors rounded-sm overflow-hidden"
    >
      {/* Product image */}
      <div className={`${product.imageColor} h-52 w-full relative overflow-hidden`}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Score badge */}
        <div className="absolute top-3 right-3 bg-forest text-vellum text-xs font-sans px-2 py-1 rounded-sm z-10">
          {product.sustainabilityScore}/100
        </div>
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <span className="text-xs font-sans uppercase tracking-widest text-mist">Out of stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-xs font-sans text-gold uppercase tracking-widest">{product.categoryLabel}</p>
        <h3 className="font-display text-lg text-ink leading-snug group-hover:text-canopy transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-mist font-sans">{product.vendor} · {product.vendorLocation}</p>
        <p className="text-xs text-mist font-sans leading-relaxed line-clamp-2">{product.shortDescription}</p>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <p className="font-display text-xl text-ink">{formatPrice(product.price)}</p>
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`text-xs font-sans uppercase tracking-widest px-3 py-1.5 border transition-colors ${
              added
                ? 'bg-canopy text-vellum border-canopy'
                : 'border-gold/60 text-gold hover:bg-gold hover:text-forest'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {added ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </Link>
  )
}
