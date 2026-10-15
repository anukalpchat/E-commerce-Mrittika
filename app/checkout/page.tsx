'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { formatPrice } from '@/lib/products'
import MockPaymentModal from './MockPaymentModal'

interface Address {
  name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
}

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Puducherry']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemCount, subtotal, clearCart } = useCart()

  const shipping = subtotal > 999 ? 0 : 89
  const total = subtotal + shipping

  const [address, setAddress] = useState<Address>({
    name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [errors, setErrors] = useState<Partial<Address & { terms: string }>>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!address.name.trim()) e.name = 'Full name is required'
    if (!/^\d{10}$/.test(address.phone)) e.phone = 'Enter a valid 10-digit mobile number'
    if (!address.line1.trim()) e.line1 = 'Address line 1 is required'
    if (!address.city.trim()) e.city = 'City is required'
    if (!address.state) e.state = 'Please select a state'
    if (!/^\d{6}$/.test(address.pincode)) e.pincode = 'Enter a valid 6-digit pincode'
    if (!termsAccepted) e.terms = 'You must accept the Terms & Conditions'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handlePlaceOrder() {
    if (!validate()) return
    setShowPayment(true)
  }

  function handlePaymentSuccess(method: string) {
    const orderId = `MRT-${Date.now().toString(36).toUpperCase()}`
    clearCart()
    router.push(`/order-confirmation?id=${orderId}&method=${encodeURIComponent(method)}&total=${total}`)
  }

  if (itemCount === 0) {
    return (
      <main className="min-h-screen bg-vellum flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-display text-4xl text-mist/40 mb-4">No items to checkout</p>
          <Link href="/categories" className="inline-block font-sans text-sm uppercase tracking-widest bg-gold text-forest px-8 py-3">
            Shop Now
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <main className="min-h-screen bg-vellum">
        {/* Header */}
        <div className="bg-parchment border-b border-sand">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <p className="text-gold font-sans text-xs uppercase tracking-widest mb-1">Checkout</p>
            <h1 className="font-display text-4xl text-ink">Complete Your Order</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
          {/* Address Form */}
          <div className="flex-1">
            <h2 className="font-display text-2xl text-ink mb-6">Delivery Address</h2>
            <div className="bg-parchment border border-sand rounded-sm p-6 space-y-4">
              <Field label="Full Name" error={errors.name}>
                <input
                  value={address.name}
                  onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                  placeholder="As on ID / delivery receipt"
                  className={inputCls(!!errors.name)}
                />
              </Field>
              <Field label="Mobile Number" error={errors.phone}>
                <input
                  value={address.phone}
                  onChange={e => setAddress(a => ({ ...a, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                  className={inputCls(!!errors.phone)}
                />
              </Field>
              <Field label="Address Line 1" error={errors.line1}>
                <input
                  value={address.line1}
                  onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                  placeholder="House / flat no., building name, street"
                  className={inputCls(!!errors.line1)}
                />
              </Field>
              <Field label="Address Line 2 (optional)">
                <input
                  value={address.line2}
                  onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                  placeholder="Landmark, area"
                  className={inputCls(false)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="City" error={errors.city}>
                  <input
                    value={address.city}
                    onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                    placeholder="City"
                    className={inputCls(!!errors.city)}
                  />
                </Field>
                <Field label="Pincode" error={errors.pincode}>
                  <input
                    value={address.pincode}
                    onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="6-digit PIN"
                    inputMode="numeric"
                    className={inputCls(!!errors.pincode)}
                  />
                </Field>
              </div>
              <Field label="State" error={errors.state}>
                <select
                  value={address.state}
                  onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                  className={inputCls(!!errors.state)}
                >
                  <option value="">Select state…</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            {/* T&C */}
            <div className="mt-6 bg-parchment border border-sand rounded-sm p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 accent-canopy shrink-0"
                />
                <span className="text-xs font-sans text-mist leading-relaxed">
                  I have read and agree to the{' '}
                  <Link href="/terms" className="text-gold underline" target="_blank">Terms & Conditions</Link>
                  ,{' '}
                  <Link href="/privacy" className="text-gold underline" target="_blank">Privacy Policy</Link>
                  , and consent to sharing my delivery address with the fulfilling vendor.
                </span>
              </label>
              {errors.terms && <p className="mt-2 text-xs text-sienna font-sans">{errors.terms}</p>}
            </div>

            <button
              onClick={handlePlaceOrder}
              className="mt-6 w-full font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-4 hover:bg-sand transition-colors"
            >
              Continue to Payment →
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 shrink-0">
            <h2 className="font-display text-2xl text-ink mb-6">Order Summary</h2>
            <div className="bg-parchment border border-sand rounded-sm p-5">
              <div className="space-y-3 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.slug} className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-sm shrink-0 overflow-hidden relative">
                      <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-sans text-ink line-clamp-1">{product.name}</p>
                      <p className="text-xs text-mist">× {quantity}</p>
                    </div>
                    <p className="text-xs font-sans text-ink shrink-0">{formatPrice(product.price * quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-sand pt-3 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-mist">
                  <span>Subtotal</span><span className="text-ink">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-mist">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-canopy' : 'text-ink'}>
                    {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-sand pt-2 flex justify-between font-medium">
                  <span className="text-ink">Total (incl. GST)</span>
                  <span className="font-display text-xl text-ink">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Payment methods info */}
            <div className="mt-4 bg-parchment border border-sand rounded-sm p-4">
              <p className="text-xs font-sans text-gold uppercase tracking-widest mb-3">Accepted Payment Methods</p>
              <div className="grid grid-cols-2 gap-2">
                {['UPI', 'Credit Card', 'Debit Card', 'Net Banking'].map(m => (
                  <div key={m} className="border border-sand rounded-sm px-2 py-1.5 text-center text-xs font-sans text-mist">
                    {m}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-mist font-sans">
                🔒 Payments are processed securely. Card details are never stored by Mrittika.
              </p>
            </div>
          </div>
        </div>
      </main>

      {showPayment && (
        <MockPaymentModal
          total={total}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-sienna font-sans">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full text-sm font-sans border rounded-sm px-3 py-2 bg-vellum text-ink focus:outline-none transition-colors ${
    hasError ? 'border-sienna focus:border-sienna' : 'border-sand focus:border-gold'
  }`
}
