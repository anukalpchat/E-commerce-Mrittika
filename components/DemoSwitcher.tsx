'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'

const ACCOUNTS = [
  { id: 'buyer', label: 'Buyer', detail: 'Priya Nair', email: 'buyer@mrittika.test' },
  { id: 'vendor', label: 'Vendor', detail: 'Aranya Botanicals', email: 'vendor@mrittika.test' },
  { id: 'admin', label: 'Admin', detail: 'Mrittika Operations', email: 'admin@mrittika.test' },
] as const

/** One-click switching between the seeded demo accounts. Renders nothing unless the server is in demo mode. */
export default function DemoSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { user, demo } = useAuth()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (!demo.enabled) return null

  async function switchTo(account: string) {
    setBusy(account)
    setError('')
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? `Could not switch (HTTP ${res.status})`)
        setBusy(null)
        return
      }
      // Full navigation so every server-rendered page and the header pick up the new session.
      window.location.href = data.redirectTo
    } catch {
      setError('Could not reach the server.')
      setBusy(null)
    }
  }

  const dark = tone === 'dark'
  const itemCls = `w-full text-left px-3 py-2 rounded-sm transition-colors disabled:opacity-50 ${
    dark ? 'text-sand hover:bg-canopy/30 hover:text-vellum' : 'text-ink hover:bg-sand/40'
  }`

  return (
    <div>
      <p className={`text-[11px] font-sans uppercase tracking-widest mb-1 px-3 ${dark ? 'text-gold' : 'text-gold'}`}>Demo quick switch</p>
      <ul className="text-sm font-sans">
        {demo.returnTo && (
          <li>
            <button type="button" disabled={!!busy} onClick={() => switchTo('return')} className={`${itemCls} font-medium`}>
              ← Back to {demo.returnTo}
            </button>
          </li>
        )}
        {ACCOUNTS.map(a => {
          const current = user?.email === a.email
          return (
            <li key={a.id}>
              <button type="button" disabled={!!busy || current} onClick={() => switchTo(a.id)} className={itemCls} aria-current={current ? 'true' : undefined}>
                <span className="block">
                  {busy === a.id ? 'Switching…' : `${a.label}${current ? ' (current)' : ''}`}
                </span>
                <span className={`block text-[11px] ${dark ? 'text-sand/60' : 'text-mist'}`}>{a.detail}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {error && <p role="alert" className="px-3 mt-1 text-xs text-sienna font-sans">{error}</p>}
    </div>
  )
}
