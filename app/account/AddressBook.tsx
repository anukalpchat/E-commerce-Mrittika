'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AddressForm from '@/components/AddressForm'
import { AddressInput, SavedAddress, validateAddress } from '@/lib/orders-shared'

const EMPTY: AddressInput = { name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' }

export default function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter()
  const [adding, setAdding] = useState(addresses.length === 0)
  const [draft, setDraft] = useState<AddressInput>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function request(url: string, init: RequestInit): Promise<boolean> {
    setError('')
    setBusy(true)
    try {
      const res = await fetch(url, { ...init, headers: { 'Content-Type': 'application/json' } })
      if (res.ok) return true
      const data = await res.json().catch(() => null)
      setErrors(data?.fieldErrors ?? {})
      setError(data?.error ?? `Request failed (HTTP ${res.status})`)
      return false
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function handleAdd() {
    const e = validateAddress(draft)
    setErrors(e)
    if (Object.keys(e).length > 0) return
    if (await request('/api/account/addresses', { method: 'POST', body: JSON.stringify(draft) })) {
      setDraft(EMPTY)
      setAdding(false)
      router.refresh()
    }
  }

  async function handleDelete(id: number) {
    if (await request(`/api/account/addresses/${id}`, { method: 'DELETE' })) router.refresh()
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {error && <p role="alert" className="border border-sienna/40 bg-sienna/5 text-sienna text-xs font-sans rounded-sm px-4 py-3">{error}</p>}

      {addresses.length === 0 && !adding && (
        <p className="text-sm text-mist font-sans">No saved addresses yet.</p>
      )}

      {addresses.map(a => (
        <div key={a.id} className="bg-parchment border border-sand rounded-sm p-4 flex items-start justify-between gap-4">
          <address className="not-italic text-sm font-sans text-ink leading-relaxed">
            <span className="font-medium">{a.name}</span> · {a.phone}<br />
            <span className="text-mist">{a.line1}{a.line2 && `, ${a.line2}`}, {a.city}, {a.state} {a.pincode}</span>
          </address>
          <button
            type="button"
            onClick={() => handleDelete(a.id)}
            disabled={busy}
            className="text-xs font-sans text-sienna underline underline-offset-2 hover:text-ink shrink-0 disabled:opacity-50"
            aria-label={`Delete address for ${a.name}, ${a.line1}`}
          >
            Delete
          </button>
        </div>
      ))}

      {adding ? (
        <div className="space-y-3">
          <h3 className="font-display text-xl text-ink">New address</h3>
          <AddressForm address={draft} onChange={setDraft} errors={errors} />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={busy}
              className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save Address'}
            </button>
            {addresses.length > 0 && (
              <button type="button" onClick={() => setAdding(false)} className="font-sans text-xs uppercase tracking-widest text-mist px-4 py-3 hover:text-ink">
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold transition-colors"
        >
          + Add Address
        </button>
      )}
    </div>
  )
}
