'use client'

import { ReactNode, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  url: string
  body: unknown
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  /** Shown in a confirm() dialog before sending, for actions that are awkward to undo. */
  confirmMessage?: string
  disabled?: boolean
}

const VARIANTS = {
  primary: 'bg-gold text-forest hover:bg-sand',
  secondary: 'border border-sand text-ink hover:border-gold',
  danger: 'border border-sienna/50 text-sienna hover:bg-sienna/5',
}

/** Sends a JSON POST, then re-renders the server page so the new state shows. */
export default function PostButton({ url, body, children, variant = 'secondary', confirmMessage, disabled }: Props) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return
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

  return (
    <span className="inline-flex flex-col items-start">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy || disabled}
        className={`font-sans text-xs uppercase tracking-widest px-4 py-2 transition-colors disabled:opacity-50 ${VARIANTS[variant]}`}
      >
        {busy ? 'Working…' : children}
      </button>
      {error && <span role="alert" className="mt-1 text-xs text-sienna font-sans max-w-xs">{error}</span>}
    </span>
  )
}
