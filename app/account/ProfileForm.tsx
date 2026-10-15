'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { PublicUser } from '@/lib/auth-types'

export default function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter()
  const { refresh } = useAuth()
  const [name, setName] = useState(user.name)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setErrors(data?.fieldErrors ?? {})
        setMessage({ kind: 'error', text: data?.error ?? `Could not save (HTTP ${res.status})` })
        return
      }
      setErrors({})
      setMessage({ kind: 'ok', text: 'Profile saved' })
      await refresh()
      router.refresh()
    } catch {
      setMessage({ kind: 'error', text: 'Could not reach the server. Check your connection and try again.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-parchment border border-sand rounded-sm p-6 space-y-5 max-w-xl">
      <div>
        <label htmlFor="profile-name" className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">Full Name</label>
        <input id="profile-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} aria-invalid={!!errors.name} className={inputCls(!!errors.name)} />
        {errors.name && <p className="mt-1 text-xs text-sienna font-sans">{errors.name}</p>}
      </div>
      <div>
        <p className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">Email</p>
        <p className="text-sm font-sans text-ink">{user.email}</p>
        <p className="text-xs text-mist font-sans mt-0.5">Email is your sign-in ID and cannot be changed here.</p>
      </div>
      <div>
        <label htmlFor="profile-phone" className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">Mobile (optional)</label>
        <input
          id="profile-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          aria-invalid={!!errors.phone}
          className={inputCls(!!errors.phone)}
        />
        {errors.phone && <p className="mt-1 text-xs text-sienna font-sans">{errors.phone}</p>}
      </div>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {message && (
          <p role="status" className={`text-xs font-sans ${message.kind === 'ok' ? 'text-canopy' : 'text-sienna'}`}>{message.text}</p>
        )}
      </div>
    </form>
  )
}

function inputCls(hasError: boolean) {
  return `w-full text-sm font-sans border rounded-sm px-3 py-2 bg-vellum text-ink focus:outline-none transition-colors ${
    hasError ? 'border-sienna focus:border-sienna' : 'border-sand focus:border-gold'
  }`
}
