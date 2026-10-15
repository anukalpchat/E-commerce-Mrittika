'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import { shippingFor } from '@/lib/orders-shared'

export default function CartPage() {
  const { items, itemCount, subtotal, removeItem, updateQty, clearCart } = useCart()

  const shipping = shippingFor(subtotal)
  const total = subtotal + shipping

  if (itemCount === 0) {
    return (
      <main className="min-h-screen bg-vellum flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-display text-5xl text-mist/40 mb-4">Your cart is empty</p>
          <p className="text-mist font-sans text-sm mb-8">Add some verified sustainable products to get started.</p>
          <Link
            href="/categories"
            className="inline-block font-sans text-sm uppercase tracking-widest bg-gold text-forest px-8 py-3 hover:bg-sand transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-vellum">
      {/* Header */}
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-4xl text-ink">Your Cart</h1>
            <p className="text-mist font-sans text-sm mt-1">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs font-sans text-mist hover:text-sienna transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.slug} className="bg-parchment border border-sand rounded-sm p-4 flex gap-4">
              {/* Image */}
              <Link href={`/product/${product.slug}`} className="shrink-0">
                <div className="w-20 h-20 rounded-sm overflow-hidden relative">
                  <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="80px" />
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link href={`/product/${product.slug}`} className="font-display text-lg text-ink hover:text-canopy transition-colors">
                      {product.name}
                    </Link>
                    <p className="text-xs text-mist font-sans">{product.vendor}</p>
                  </div>
                  <button
                    onClick={() => removeItem(product.slug)}
                    className="text-mist hover:text-sienna text-sm transition-colors shrink-0"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  {/* Qty */}
                  <div className="flex items-center border border-sand rounded-sm">
                    <button
                      onClick={() => updateQty(product.slug, quantity - 1)}
                      className="px-3 py-1 text-mist hover:text-ink text-lg leading-none"
                    >−</button>
                    <span className="px-3 font-sans text-sm text-ink">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.slug, quantity + 1)}
                      className="px-3 py-1 text-mist hover:text-ink text-lg leading-none"
                    >+</button>
                  </div>
                  <p className="font-display text-xl text-ink">{formatPrice(product.price * quantity)}</p>
                </div>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link href="/categories" className="text-xs font-sans text-gold hover:text-canopy transition-colors">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-parchment border border-sand rounded-sm p-6 sticky top-6">
            <h2 className="font-display text-2xl text-ink mb-5">Order Summary</h2>

            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between text-mist">
                <span>Subtotal ({itemCount} items)</span>
                <span className="text-ink">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-mist">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-canopy' : 'text-ink'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-mist">Free shipping on orders above ₹999</p>
              )}
              <div className="border-t border-sand pt-3 flex justify-between font-medium">
                <span className="text-ink">Total</span>
                <span className="font-display text-xl text-ink">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-mist">GST included in product prices</p>
            </div>

            {/* Promo code */}
            <div className="mt-5 flex gap-2">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 text-xs font-sans border border-sand bg-vellum px-3 py-2 text-ink focus:outline-none focus:border-gold rounded-sm"
              />
              <button className="text-xs font-sans border border-sand px-3 py-2 text-mist hover:border-gold hover:text-gold transition-colors rounded-sm">
                Apply
              </button>
            </div>

            <Link
              href="/checkout"
              className="mt-5 block w-full text-center font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors"
            >
              Proceed to Checkout →
            </Link>

            <p className="mt-3 text-xs text-mist text-center font-sans">
              Secure payment · By continuing you agree to our{' '}
              <Link href="/terms" className="underline">Terms</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
