'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { inputClass } from '@/components/FormField'
import type { ProductStatus, VendorStatus } from '@/lib/vendor-shared'
import { TICKET_STATUS_LABELS, TicketStatus } from '@/lib/support-shared'

function useAction(url: string) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function run(body: unknown) {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? `Request failed (HTTP ${res.status})`)
        return
      }
      router.refresh()
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }
  return { busy, error, run }
}

const btn = 'font-sans text-xs uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50'
const approveBtn = `${btn} bg-canopy text-vellum hover:bg-forest`
const rejectBtn = `${btn} border border-sienna/50 text-sienna hover:bg-sienna/5`
const neutralBtn = `${btn} border border-sand text-ink hover:border-gold`

export function VendorReviewControls({ vendorId, status, commissionRate }: { vendorId: number; status: VendorStatus; commissionRate: number }) {
  const { busy, error, run } = useAction(`/api/admin/vendors/${vendorId}`)
  const [note, setNote] = useState('')
  const [rate, setRate] = useState(String(commissionRate))

  if (status === 'rejected') return null

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status === 'pending' && (
          <label className="flex items-center gap-2 text-xs font-sans text-mist">
            Commission %
            <input value={rate} onChange={e => setRate(e.target.value)} inputMode="decimal" className={`${inputClass(false)} !w-16 !py-1`} aria-label="Commission rate percent" />
          </label>
        )}
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={status === 'pending' ? 'Note to vendor (required to reject)' : 'Reason (required to suspend)'}
          aria-label="Review note"
          className={`${inputClass(false)} !py-1 flex-1 min-w-[12rem]`}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {status === 'pending' && (
          <>
            <button type="button" disabled={busy} className={approveBtn} onClick={() => run({ action: 'approve', note, commissionRate: Number(rate) })}>Approve</button>
            <button type="button" disabled={busy} className={rejectBtn} onClick={() => run({ action: 'reject', note })}>Reject</button>
          </>
        )}
        {status === 'approved' && (
          <button type="button" disabled={busy} className={rejectBtn} onClick={() => run({ action: 'suspend', note })}>Suspend</button>
        )}
        {status === 'suspended' && (
          <button type="button" disabled={busy} className={neutralBtn} onClick={() => run({ action: 'reinstate', note })}>Reinstate</button>
        )}
      </div>
      {error && <p role="alert" className="text-xs text-sienna font-sans">{error}</p>}
    </div>
  )
}

export function ProductReviewControls({ productId, status }: { productId: number; status: ProductStatus }) {
  const { busy, error, run } = useAction(`/api/admin/products/${productId}`)
  const [score, setScore] = useState('')
  const [note, setNote] = useState('')

  if (status === 'rejected') return null

  return (
    <div className="space-y-2">
      {status === 'pending_review' && (
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 text-xs font-sans text-mist">
            Score
            <input value={score} onChange={e => setScore(e.target.value.replace(/\D/g, '').slice(0, 3))} inputMode="numeric" placeholder="60–100" aria-label="Sustainability score" className={`${inputClass(false)} !w-20 !py-1`} />
          </label>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note to vendor (required to reject)" aria-label="Review note" className={`${inputClass(false)} !py-1 flex-1 min-w-[12rem]`} />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {status === 'pending_review' && (
          <>
            <button type="button" disabled={busy} className={approveBtn} onClick={() => run({ action: 'approve', score: score === '' ? null : Number(score), note })}>Approve &amp; Score</button>
            <button type="button" disabled={busy} className={rejectBtn} onClick={() => run({ action: 'reject', note })}>Reject</button>
          </>
        )}
        {status === 'active' && <button type="button" disabled={busy} className={rejectBtn} onClick={() => run({ action: 'hide', note: '' })}>Hide from shop</button>}
        {status === 'hidden' && <button type="button" disabled={busy} className={neutralBtn} onClick={() => run({ action: 'unhide', note: '' })}>Unhide</button>}
      </div>
      {error && <p role="alert" className="text-xs text-sienna font-sans">{error}</p>}
    </div>
  )
}

export function TicketControls({ ticketId, status, adminNote }: { ticketId: string; status: TicketStatus; adminNote: string | null }) {
  const { busy, error, run } = useAction(`/api/admin/support/${ticketId}`)
  const [next, setNext] = useState<TicketStatus>(status)
  const [note, setNote] = useState(adminNote ?? '')

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <select value={next} onChange={e => setNext(e.target.value as TicketStatus)} aria-label="Ticket status" className={`${inputClass(false)} !w-40 !py-1`}>
          {(Object.keys(TICKET_STATUS_LABELS) as TicketStatus[]).map(s => <option key={s} value={s}>{TICKET_STATUS_LABELS[s]}</option>)}
        </select>
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Resolution note — shown to the customer once resolved"
          aria-label="Admin note"
          className={`${inputClass(false)} !py-1 flex-1 min-w-[14rem]`}
        />
        <button type="button" disabled={busy} className={neutralBtn} onClick={() => run({ status: next, note })}>Save</button>
      </div>
      {error && <p role="alert" className="text-xs text-sienna font-sans">{error}</p>}
    </div>
  )
}
