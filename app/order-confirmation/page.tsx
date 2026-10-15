'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function formatPrice(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function estimatedDelivery() {
  const d = new Date()
  d.setDate(d.getDate() + 5)
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
}

function OrderContent() {
  const params = useSearchParams()
  const orderId = params.get('id') ?? 'MRT-UNKNOWN'
  const method = params.get('method') ?? 'Payment'
  const total = Number(params.get('total') ?? 0)

  return (
    <main className="min-h-screen bg-vellum flex items-center justify-center px-6 py-14">
      <div className="w-full max-w-lg">
        {/* Success card */}
        <div className="bg-parchment border border-sand rounded-sm overflow-hidden">
          {/* Green banner */}
          <div className="bg-canopy text-vellum px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-3xl">✓</span>
            </div>
            <h1 className="font-display text-3xl">Order Confirmed!</h1>
            <p className="text-vellum/80 font-sans text-sm mt-2">
              Thank you for your purchase. Your order is confirmed.
            </p>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-4">
            <div className="flex justify-between text-sm font-sans border-b border-sand pb-4">
              <div>
                <p className="text-mist text-xs uppercase tracking-widest mb-0.5">Order ID</p>
                <p className="font-mono text-ink font-medium">{orderId}</p>
              </div>
              <div className="text-right">
                <p className="text-mist text-xs uppercase tracking-widest mb-0.5">Amount Paid</p>
                <p className="font-display text-xl text-canopy">{formatPrice(total)}</p>
              </div>
            </div>

            <div className="flex justify-between text-sm font-sans border-b border-sand pb-4">
              <div>
                <p className="text-mist text-xs uppercase tracking-widest mb-0.5">Paid via</p>
                <p className="text-ink">{method}</p>
              </div>
              <div className="text-right">
                <p className="text-mist text-xs uppercase tracking-widest mb-0.5">Date</p>
                <p className="text-ink">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="bg-vellum border border-sand rounded-sm p-4">
              <p className="text-xs font-sans text-gold uppercase tracking-widest mb-1">Estimated Delivery</p>
              <p className="font-display text-xl text-ink">{estimatedDelivery()}</p>
              <p className="text-xs text-mist font-sans mt-1">A confirmation email will be sent shortly.</p>
            </div>

            {/* What's next */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-sans text-gold uppercase tracking-widest">What happens next</p>
              {[
                { step: '1', text: 'Confirmation email sent to your registered address' },
                { step: '2', text: 'Vendor prepares your order (1–2 business days)' },
                { step: '3', text: 'Shipped via eco-conscious courier partner' },
                { step: '4', text: 'Delivered to your address with tracking updates' },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3">
                  <span className="w-5 h-5 bg-canopy/10 text-canopy rounded-full flex items-center justify-center text-xs font-sans font-medium shrink-0 mt-0.5">
                    {s.step}
                  </span>
                  <p className="text-xs text-mist font-sans leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 pb-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 text-center font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              href="/profile"
              className="flex-1 text-center font-sans text-sm uppercase tracking-widest border border-sand text-mist px-6 py-3 hover:border-gold hover:text-gold transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>

        {/* Sustainability note */}
        <div className="mt-5 bg-canopy/5 border border-canopy/20 rounded-sm p-4 flex items-start gap-3">
          <span className="text-canopy text-xl shrink-0">🌿</span>
          <p className="text-xs font-sans text-mist leading-relaxed">
            Your order supports verified sustainable vendors and contributes to our platform-wide impact.
            Every purchase is tracked in your personal impact dashboard.
          </p>
        </div>
      </div>
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-vellum" />}>
      <OrderContent />
    </Suspense>
  )
}
