'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'
import { formatPrice } from '@/lib/products'
import type { ApiError } from '@/lib/auth-types'
import {
  AddressInput,
  OrderDetail,
  PaymentOutcome,
  SavedAddress,
  shippingFor,
  validateAddress,
} from '@/lib/orders-shared'
import MockPaymentModal from './MockPaymentModal'
import AddressForm from '@/components/AddressForm'

const EMPTY_ADDRESS: AddressInput = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' }
const NEW_ADDRESS = 'new'

async function sendJson<T>(url: string, body: unknown): Promise<{ data: T } | { error: ApiError }> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json().catch(() => null)
    if (res.ok && json) return { data: json as T }
    return { error: (json as ApiError) ?? { error: `Request failed (HTTP ${res.status}). Please try again.` } }
  } catch {
    return { error: { error: 'Could not reach the server. Check your connection and try again.' } }
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, itemCount, subtotal, clearCart } = useCart()
  const { user, status } = useAuth()

  const shipping = shippingFor(subtotal)
  const total = subtotal + shipping

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[] | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<string>(NEW_ADDRESS)
  const [address, setAddress] = useState<AddressInput>(EMPTY_ADDRESS)
  const [saveAddress, setSaveAddress] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<OrderDetail | null>(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/account/addresses', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { addresses: SavedAddress[] }) => {
        setSavedAddresses(data.addresses)
        if (data.addresses.length > 0) setSelectedAddress(String(data.addresses[0].id))
      })
      .catch(err => {
        // Saved addresses are a convenience; fall back to the manual form.
        console.error('Could not load saved addresses', err)
        setSavedAddresses([])
      })
  }, [user])

  async function handlePlaceOrder() {
    setFormError('')
    setNotice('')
    const usingSaved = selectedAddress !== NEW_ADDRESS
    const e: Record<string, string> = usingSaved ? {} : validateAddress(address)
    if (!termsAccepted) e.terms = 'You must accept the Terms & Conditions'
    setErrors(e)
    if (Object.keys(e).length > 0) return

    setSubmitting(true)
    const result = await sendJson<{ order: OrderDetail }>('/api/orders', {
      items: items.map(i => ({ slug: i.product.slug, quantity: i.quantity })),
      ...(usingSaved ? { addressId: Number(selectedAddress) } : { address, saveAddress }),
      acceptTerms: termsAccepted,
    })
    setSubmitting(false)
    if ('error' in result) {
      setErrors(result.error.fieldErrors ?? {})
      setFormError(result.error.error)
      return
    }
    setOrder(result.data.order)
  }

  async function handleOutcome(outcome: PaymentOutcome, method: string): Promise<string | null> {
    if (!order) return 'No order in progress'
    const result = await sendJson<{ order: OrderDetail }>(`/api/orders/${order.id}/payment`, { outcome, method })
    if ('error' in result) return result.error.error
    if (outcome === 'success') clearCart()
    return null
  }

  async function handleCancel() {
    if (!order) return
    const cancelled = order
    setOrder(null)
    const error = await handleOutcome('cancelled', 'Cancelled before payment')
    setNotice(
      error
        ? `Could not cancel order ${cancelled.id}: ${error}`
        : `Payment cancelled. Order ${cancelled.id} was cancelled and nothing was charged. Your cart is unchanged.`,
    )
  }

  if (itemCount === 0 && !order) {
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
        <div className="bg-parchment border-b border-sand">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <p className="text-gold font-sans text-xs uppercase tracking-widest mb-1">Checkout</p>
            <h1 className="font-display text-4xl text-ink">Complete Your Order</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col lg:flex-row gap-10">
          <div className="flex-1">
            {status === 'loading' ? (
              <div className="h-80 bg-parchment border border-sand rounded-sm animate-pulse" aria-hidden="true" />
            ) : !user ? (
              <SignInPrompt />
            ) : (
              <>
                {notice && (
                  <div role="status" className="mb-6 border border-gold/50 bg-gold/10 text-ink text-sm font-sans rounded-sm px-4 py-3">
                    {notice}
                  </div>
                )}
                <h2 className="font-display text-2xl text-ink mb-6">Delivery Address</h2>

                {savedAddresses === null ? (
                  <div className="h-40 bg-parchment border border-sand rounded-sm animate-pulse" aria-hidden="true" />
                ) : (
                  <fieldset className="space-y-3">
                    <legend className="sr-only">Choose a delivery address</legend>
                    {savedAddresses.map(a => (
                      <label
                        key={a.id}
                        className={`flex items-start gap-3 bg-parchment border rounded-sm p-4 cursor-pointer ${
                          selectedAddress === String(a.id) ? 'border-gold' : 'border-sand'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={a.id}
                          checked={selectedAddress === String(a.id)}
                          onChange={() => setSelectedAddress(String(a.id))}
                          className="mt-1 accent-canopy"
                        />
                        <span className="text-sm font-sans text-ink leading-relaxed">
                          <span className="font-medium">{a.name}</span> · {a.phone}
                          <br />
                          <span className="text-mist">
                            {a.line1}{a.line2 && `, ${a.line2}`}, {a.city}, {a.state} {a.pincode}
                          </span>
                        </span>
                      </label>
                    ))}
                    {savedAddresses.length > 0 && (
                      <label
                        className={`flex items-center gap-3 bg-parchment border rounded-sm p-4 cursor-pointer ${
                          selectedAddress === NEW_ADDRESS ? 'border-gold' : 'border-sand'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={NEW_ADDRESS}
                          checked={selectedAddress === NEW_ADDRESS}
                          onChange={() => setSelectedAddress(NEW_ADDRESS)}
                          className="accent-canopy"
                        />
                        <span className="text-sm font-sans text-ink">Deliver to a new address</span>
                      </label>
                    )}
                    {selectedAddress === NEW_ADDRESS && (
                      <AddressForm address={address} onChange={setAddress} errors={errors} saveAddress={saveAddress} onSaveChange={setSaveAddress} />
                    )}
                  </fieldset>
                )}

                <div className="mt-6 bg-parchment border border-sand rounded-sm p-4">
                  <label htmlFor="checkout-terms" className="flex items-start gap-3 cursor-pointer">
                    <input
                      id="checkout-terms"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={e => setTermsAccepted(e.target.checked)}
                      aria-invalid={!!errors.terms}
                      aria-describedby={errors.terms ? 'checkout-terms-error' : undefined}
                      className="mt-0.5 accent-canopy shrink-0 w-4 h-4"
                    />
                    <span className="text-xs font-sans text-mist leading-relaxed">
                      I have read and agree to the{' '}
                      <Link href="/terms" className="text-gold underline" target="_blank">Terms & Conditions</Link>
                      ,{' '}
                      <Link href="/privacy" className="text-gold underline" target="_blank">Privacy Policy</Link>
                      , and consent to sharing my delivery address with the fulfilling vendor.
                    </span>
                  </label>
                  {errors.terms && <p id="checkout-terms-error" className="mt-2 text-xs text-sienna font-sans">{errors.terms}</p>}
                </div>

                {formError && (
                  <p role="alert" className="mt-4 border border-sienna/40 bg-sienna/5 text-sienna text-xs font-sans rounded-sm px-4 py-3">
                    {formError}
                  </p>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="mt-6 w-full font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-4 hover:bg-sand transition-colors disabled:opacity-60 disabled:cursor-wait"
                >
                  {submitting ? 'Placing order…' : 'Place Order & Pay →'}
                </button>
              </>
            )}
          </div>

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

            <div className="mt-4 bg-amber-50 border border-amber-300 rounded-sm p-4">
              <p className="text-xs font-sans text-amber-900 uppercase tracking-widest mb-2">Demo payment</p>
              <p className="text-xs text-amber-900 font-sans leading-relaxed">
                Payment is simulated for this lab project. You choose whether it succeeds or fails; no money moves and no
                card details are sent to our server.
              </p>
            </div>
          </div>
        </div>
      </main>

      {order && (
        <MockPaymentModal
          orderId={order.id}
          total={order.total}
          onOutcome={handleOutcome}
          onViewOrder={() => router.push(`/orders/${order.id}`)}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}

function SignInPrompt() {
  return (
    <div className="bg-parchment border border-sand rounded-sm p-8 text-center">
      <h2 className="font-display text-2xl text-ink">Sign in to check out</h2>
      <p className="mt-2 text-sm text-mist font-sans">
        We need an account to save your order, track delivery and add it to your impact dashboard. Your cart is kept.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/auth?next=/checkout" className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors">
          Sign In
        </Link>
        <Link href="/auth?tab=register&next=/checkout" className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold transition-colors">
          Create Account
        </Link>
      </div>
    </div>
  )
}
