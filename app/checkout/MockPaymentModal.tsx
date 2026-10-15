'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/products'
import type { PaymentOutcome } from '@/lib/orders-shared'

type PaymentTab = 'upi' | 'card' | 'netbanking'
type Stage = 'form' | 'processing' | 'success' | 'failed'

// SIMULATED PAYMENT. No gateway is called and nothing typed here leaves the browser except a
// method label (e.g. "Card ···· 4242"). The chosen demo outcome is reported to the order API.
interface Props {
  orderId: string
  total: number
  /** Records the outcome on the order; resolves to an error message, or null on success. */
  onOutcome: (outcome: PaymentOutcome, method: string) => Promise<string | null>
  onViewOrder: () => void
  onCancel: () => void
}

const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank']

export default function MockPaymentModal({ orderId, total, onOutcome, onViewOrder, onCancel }: Props) {
  const [tab, setTab] = useState<PaymentTab>('upi')
  const [stage, setStage] = useState<Stage>('form')
  const [simulate, setSimulate] = useState<'success' | 'failed'>('success')
  const [apiError, setApiError] = useState('')

  // UPI state
  const [upiId, setUpiId] = useState('')
  const [upiError, setUpiError] = useState('')

  // Card state
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [cardErrors, setCardErrors] = useState<Partial<typeof card>>({})

  // Net banking state
  const [bank, setBank] = useState('')
  const [bankError, setBankError] = useState('')

  function formatCardNumber(v: string) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  }

  function formatExpiry(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  function validateAndPay() {
    if (tab === 'upi') {
      if (!/^[\w.\-]+@[\w]+$/.test(upiId.trim())) {
        setUpiError('Enter a valid UPI ID (e.g. name@upi)')
        return
      }
      setUpiError('')
    }
    if (tab === 'card') {
      const e: Partial<typeof card> = {}
      if (card.number.replace(/\s/g, '').length < 16) e.number = 'Enter a valid 16-digit card number'
      if (!card.name.trim()) e.name = 'Enter cardholder name'
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) e.expiry = 'MM/YY format'
      if (card.cvv.length < 3) e.cvv = '3-digit CVV'
      setCardErrors(e)
      if (Object.keys(e).length > 0) return
    }
    if (tab === 'netbanking') {
      if (!bank) { setBankError('Please select a bank'); return }
      setBankError('')
    }

    setApiError('')
    setStage('processing')
    // Short pause so the demo feels like a payment round-trip.
    setTimeout(async () => {
      const error = await onOutcome(simulate, getMethodLabel())
      if (error) {
        setApiError(error)
        setStage('form')
        return
      }
      setStage(simulate === 'success' ? 'success' : 'failed')
    }, 1500)
  }

  function getMethodLabel() {
    if (tab === 'upi') return `UPI · ${upiId}`
    if (tab === 'card') return `Card ···· ${card.number.replace(/\s/g, '').slice(-4)}`
    return `Net Banking · ${bank}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" role="dialog" aria-modal="true" aria-labelledby="payment-title">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto">
        <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs font-sans px-6 py-2 text-center">
          <strong>Simulated payment</strong> — no money is charged and no gateway is contacted.
        </div>
        {/* Modal header */}
        <div className="bg-forest text-vellum px-6 py-4 flex items-center justify-between">
          <div>
            <p id="payment-title" className="font-sans text-xs text-sand/70 uppercase tracking-widest">Order {orderId}</p>
            <p className="font-display text-2xl text-gold mt-0.5">{formatPrice(total)}</p>
          </div>
          {stage === 'form' && (
            <button onClick={onCancel} className="text-sand/60 hover:text-vellum text-xl leading-none" aria-label="Cancel payment">✕</button>
          )}
        </div>

        {/* Processing overlay */}
        {stage === 'processing' && (
          <div className="px-6 py-14 flex flex-col items-center gap-5 bg-white">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-sand rounded-full" />
              <div className="absolute inset-0 border-4 border-t-canopy rounded-full animate-spin" />
            </div>
            <p className="font-display text-xl text-ink">Simulating payment…</p>
            <p className="text-xs text-mist font-sans text-center">Recording the outcome on your order.</p>
          </div>
        )}

        {/* Success */}
        {stage === 'success' && (
          <div className="px-6 py-12 flex flex-col items-center gap-5 bg-white text-center">
            <div className="w-16 h-16 bg-canopy rounded-full flex items-center justify-center">
              <span className="text-white text-3xl">✓</span>
            </div>
            <div>
              <p className="font-display text-2xl text-ink">Payment Successful!</p>
              <p className="text-mist font-sans text-sm mt-2">{formatPrice(total)} paid via {getMethodLabel()}</p>
            </div>
            <button
              onClick={onViewOrder}
              autoFocus
              className="w-full mt-2 font-sans text-sm uppercase tracking-widest bg-canopy text-vellum px-6 py-3 hover:bg-forest transition-colors"
            >
              View Order →
            </button>
          </div>
        )}

        {stage === 'failed' && (
          <div className="px-6 py-12 flex flex-col items-center gap-5 bg-white text-center">
            <div className="w-16 h-16 bg-sienna rounded-full flex items-center justify-center">
              <span className="text-white text-3xl">✕</span>
            </div>
            <div>
              <p className="font-display text-2xl text-ink">Payment Failed</p>
              <p className="text-mist font-sans text-sm mt-2">Nothing was charged. Your order is saved — you can try again.</p>
            </div>
            <div className="w-full flex gap-3">
              <button
                onClick={() => setStage('form')}
                autoFocus
                className="flex-1 font-sans text-sm uppercase tracking-widest bg-gold text-forest px-4 py-3 hover:bg-sand transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onViewOrder}
                className="flex-1 font-sans text-sm uppercase tracking-widest border border-sand text-mist px-4 py-3 hover:border-gold hover:text-ink transition-colors"
              >
                View Order
              </button>
            </div>
          </div>
        )}

        {/* Payment form */}
        {stage === 'form' && (
          <div className="bg-vellum">
            {/* Tabs */}
            <div className="flex border-b border-sand bg-parchment">
              {([['upi', 'UPI'], ['card', 'Card'], ['netbanking', 'Net Banking']] as [PaymentTab, string][]).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-xs font-sans uppercase tracking-widest transition-colors ${
                    tab === t ? 'bg-white text-ink border-b-2 border-gold' : 'text-mist hover:text-ink'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {/* UPI */}
              {tab === 'upi' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                      <span key={app} className="text-xs font-sans border border-sand px-3 py-1.5 rounded-full text-mist bg-white">
                        {app}
                      </span>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">UPI ID</label>
                    <input
                      value={upiId}
                      onChange={e => { setUpiId(e.target.value); setUpiError('') }}
                      placeholder="yourname@upi"
                      className={`w-full text-sm font-sans border rounded-sm px-3 py-2.5 bg-white text-ink focus:outline-none transition-colors ${upiError ? 'border-sienna' : 'border-sand focus:border-gold'}`}
                    />
                    {upiError && <p className="mt-1 text-xs text-sienna">{upiError}</p>}
                  </div>
                  <p className="text-xs text-mist font-sans">Demo: no request is sent to any UPI app.</p>
                </div>
              )}

              {/* Card */}
              {tab === 'card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">Card Number</label>
                    <input
                      value={card.number}
                      onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      maxLength={19}
                      className={`w-full text-sm font-sans border rounded-sm px-3 py-2.5 bg-white text-ink focus:outline-none font-mono tracking-wider transition-colors ${cardErrors.number ? 'border-sienna' : 'border-sand focus:border-gold'}`}
                    />
                    {cardErrors.number && <p className="mt-1 text-xs text-sienna">{cardErrors.number}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">Cardholder Name</label>
                    <input
                      value={card.name}
                      onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                      placeholder="Name on card"
                      className={`w-full text-sm font-sans border rounded-sm px-3 py-2.5 bg-white text-ink focus:outline-none uppercase tracking-wide transition-colors ${cardErrors.name ? 'border-sienna' : 'border-sand focus:border-gold'}`}
                    />
                    {cardErrors.name && <p className="mt-1 text-xs text-sienna">{cardErrors.name}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">Expiry</label>
                      <input
                        value={card.expiry}
                        onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        maxLength={5}
                        className={`w-full text-sm font-sans border rounded-sm px-3 py-2.5 bg-white text-ink focus:outline-none transition-colors ${cardErrors.expiry ? 'border-sienna' : 'border-sand focus:border-gold'}`}
                      />
                      {cardErrors.expiry && <p className="mt-1 text-xs text-sienna">{cardErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">CVV</label>
                      <input
                        value={card.cvv}
                        onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        placeholder="CVV"
                        inputMode="numeric"
                        type="password"
                        maxLength={4}
                        className={`w-full text-sm font-sans border rounded-sm px-3 py-2.5 bg-white text-ink focus:outline-none transition-colors ${cardErrors.cvv ? 'border-sienna' : 'border-sand focus:border-gold'}`}
                      />
                      {cardErrors.cvv && <p className="mt-1 text-xs text-sienna">{cardErrors.cvv}</p>}
                    </div>
                  </div>
                  <p className="text-xs text-mist font-sans">Demo: card details stay in this browser window and are never sent to our server.</p>
                </div>
              )}

              {/* Net Banking */}
              {tab === 'netbanking' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {BANKS.slice(0, 4).map(b => (
                      <button
                        key={b}
                        onClick={() => { setBank(b); setBankError('') }}
                        className={`text-xs font-sans border rounded-sm px-3 py-2.5 text-left transition-colors ${bank === b ? 'border-canopy bg-canopy/5 text-canopy' : 'border-sand text-mist hover:border-gold hover:text-ink bg-white'}`}
                      >
                        {b.replace(' Bank', '').replace('State Bank of India', 'SBI')}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">All Banks</label>
                    <select
                      value={bank}
                      onChange={e => { setBank(e.target.value); setBankError('') }}
                      className={`w-full text-sm font-sans border rounded-sm px-3 py-2.5 bg-white text-ink focus:outline-none transition-colors ${bankError ? 'border-sienna' : 'border-sand focus:border-gold'}`}
                    >
                      <option value="">Select your bank…</option>
                      {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                    {bankError && <p className="mt-1 text-xs text-sienna">{bankError}</p>}
                  </div>
                  <p className="text-xs text-mist font-sans">Demo: no bank redirect happens.</p>
                </div>
              )}

              <fieldset className="border border-dashed border-amber-300 bg-amber-50 rounded-sm px-4 py-3">
                <legend className="px-1 text-xs font-sans text-amber-900 uppercase tracking-widest">Demo outcome</legend>
                <div className="flex gap-6 text-sm font-sans text-ink">
                  {(['success', 'failed'] as const).map(o => (
                    <label key={o} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="simulate" value={o} checked={simulate === o} onChange={() => setSimulate(o)} className="accent-canopy" />
                      {o === 'success' ? 'Payment succeeds' : 'Payment fails'}
                    </label>
                  ))}
                </div>
              </fieldset>

              {apiError && <p role="alert" className="text-xs text-sienna font-sans">{apiError}</p>}

              <button
                onClick={validateAndPay}
                className="w-full mt-2 font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-amber-400 transition-colors"
              >
                Pay {formatPrice(total)}
              </button>

              <p className="text-center text-xs text-mist font-sans">
                Simulated checkout for the Mrittika lab project
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
