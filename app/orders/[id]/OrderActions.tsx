'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PaymentOutcome } from '@/lib/orders-shared'
import MockPaymentModal from '@/app/checkout/MockPaymentModal'
import { useCart } from '@/lib/cart-context'

interface Props {
  orderId: string
  total: number
  canPay: boolean
  canPrint: boolean
}

export default function OrderActions({ orderId, total, canPay, canPrint }: Props) {
  const router = useRouter()
  const { clearCart } = useCart()
  const [paying, setPaying] = useState(false)

  if (!canPay && !canPrint) return null

  async function handleOutcome(outcome: PaymentOutcome, method: string): Promise<string | null> {
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome, method }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        return data?.error ?? `Could not record payment (HTTP ${res.status})`
      }
      if (outcome === 'success') clearCart()
      return null
    } catch {
      return 'Could not reach the server. Check your connection and try again.'
    }
  }

  function closeAndRefresh() {
    setPaying(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap gap-3 no-print">
      {canPay && (
        <button
          onClick={() => setPaying(true)}
          className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors"
        >
          Pay Now (Demo)
        </button>
      )}
      {canPrint && (
        <button
          onClick={() => window.print()}
          className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold transition-colors"
        >
          Print / Save Invoice
        </button>
      )}
      {paying && (
        <MockPaymentModal
          orderId={orderId}
          total={total}
          onOutcome={handleOutcome}
          onViewOrder={closeAndRefresh}
          onCancel={() => setPaying(false)}
        />
      )}
    </div>
  )
}
