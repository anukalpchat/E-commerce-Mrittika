'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import WishlistButton from '@/components/WishlistButton'
import type { Product } from '@/lib/products'

export default function WishlistGrid({ products }: { products: Product[] }) {
  const [items, setItems] = useState(products)

  if (items.length === 0) {
    return (
      <div className="border border-dashed border-sand rounded-sm p-10 text-center bg-parchment/40">
        <p className="font-display text-2xl text-mist">Your wishlist is empty</p>
        <p className="text-sm text-mist font-sans mt-2">Tap “Save to wishlist” on any product to keep it here.</p>
        <Link href="/categories" className="inline-block mt-5 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {items.map(p => (
        <div key={p.slug} className="space-y-2">
          <ProductCard product={p} />
          <WishlistButton
            slug={p.slug}
            initiallySaved
            variant="compact"
            onRemoved={() => setItems(list => list.filter(i => i.slug !== p.slug))}
          />
        </div>
      ))}
    </div>
  )
}
