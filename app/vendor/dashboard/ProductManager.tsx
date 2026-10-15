'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import StatusPill, { Tone } from '@/components/StatusPill'
import { formatPrice } from '@/lib/products'
import { CATEGORY_LABELS, PRODUCT_STATUS_LABELS, ProductStatus, VendorProduct } from '@/lib/vendor-shared'
import type { Category } from '@/lib/products'
import ProductForm from './ProductForm'

const STATUS_TONE: Record<ProductStatus, Tone> = { active: 'good', pending_review: 'waiting', rejected: 'bad', hidden: 'muted' }

export default function ProductManager({ products }: { products: VendorProduct[] }) {
  const [editing, setEditing] = useState<VendorProduct | 'new' | null>(null)

  if (editing) {
    return (
      <div className="max-w-3xl">
        <button type="button" onClick={() => setEditing(null)} className="text-xs font-sans text-mist hover:text-ink mb-4">
          ← Back to products
        </button>
        <h2 className="font-display text-3xl text-ink mb-1">{editing === 'new' ? 'Add a product' : `Edit ${editing.name}`}</h2>
        <p className="text-sm text-mist font-sans mb-6">
          {editing === 'new'
            ? 'New listings are reviewed by Mrittika, who assign the sustainability score before they go live.'
            : 'Price and stock changes go live immediately. Changing anything else sends the listing back for review.'}
        </p>
        <ProductForm initial={editing === 'new' ? null : editing} onDone={() => setEditing(null)} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl text-ink">Your products</h2>
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors"
        >
          + Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="border border-dashed border-sand rounded-sm p-10 text-center bg-parchment/40">
          <p className="font-display text-2xl text-mist">No products yet</p>
          <p className="text-sm text-mist font-sans mt-2">Add your first product to send it for review.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {products.map(p => (
            <li key={p.id} className="bg-parchment border border-sand rounded-sm p-4 flex flex-wrap items-center gap-4">
              <div className="w-16 h-16 relative rounded-sm overflow-hidden shrink-0 bg-sand/40">
                <Image src={p.imageUrl} alt="" fill className="object-cover" sizes="64px" />
              </div>
              <div className="flex-1 min-w-[12rem]">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg text-ink">{p.name}</p>
                  <StatusPill tone={STATUS_TONE[p.status]}>{PRODUCT_STATUS_LABELS[p.status]}</StatusPill>
                </div>
                <p className="text-xs text-mist font-sans">
                  {CATEGORY_LABELS[p.category as Category]} · {formatPrice(p.price)} · {p.stockCount} in stock
                  {p.sustainabilityScore !== null && <> · Score {p.sustainabilityScore}/100</>}
                </p>
                {p.reviewNote && (p.status === 'rejected' || p.status === 'hidden') && (
                  <p className="text-xs text-sienna font-sans mt-1">Reviewer note: {p.reviewNote}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {p.status === 'active' && (
                  <Link href={`/product/${p.slug}`} className="text-xs font-sans text-mist underline underline-offset-2 hover:text-ink">
                    View in shop
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-4 py-2 hover:border-gold"
                >
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
