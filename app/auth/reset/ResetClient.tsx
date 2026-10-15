'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { errorProps, FormAlert, FormField } from '@/components/FormField'
import { PASSWORD_MIN_LENGTH, validateNewPassword } from '@/lib/auth-validation'

async function post(url: string, body: unknown): Promise<{ ok: boolean; data: Record<string, unknown> | null; status: number }> {
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    return { ok: res.ok, data: await res.json().catch(() => null), status: res.status }
  } catch {
    return { ok: false, data: { error: 'Could not reach the server. Check your connection and try again.' }, status: 0 }
  }
}

export default function ResetClient() {
  const token = useSearchParams().get('token')
  return token ? <NewPasswordForm token={token} /> : <RequestForm />
}

function RequestForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ message: string; demoResetLink?: string } | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const res = await post('/api/auth/password-reset/request', { email })
    setBusy(false)
    if (!res.ok) {
      setError(String(res.data?.error ?? `Request failed (HTTP ${res.status})`))
      return
    }
    setResult(res.data as { message: string; demoResetLink?: string })
  }

  if (result) {
    return (
      <div role="status" className="bg-parchment border border-sand rounded-sm p-6 space-y-4">
        <p className="text-sm font-sans text-ink">{result.message}</p>
        {result.demoResetLink && (
          <div className="bg-amber-50 border border-amber-300 rounded-sm p-4 text-xs font-sans text-amber-900">
            <p><strong>Demo shortcut:</strong> this project has no email service, so the link that would be emailed is shown here instead. It is never shown in production.</p>
            <Link href={result.demoResetLink} className="inline-block mt-3 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-5 py-2 hover:bg-sand">
              Open reset link
            </Link>
          </div>
        )}
        <Link href="/auth" className="text-xs font-sans text-sienna underline underline-offset-2">Back to sign in</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-parchment border border-sand rounded-sm p-6 space-y-5">
      <p className="text-sm text-mist font-sans">Enter the email you registered with and we will send you a link to choose a new password.</p>
      {error && <FormAlert message={error} />}
      <FormField id="reset-email" label="Email">
        <input id="reset-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} {...errorProps('reset-email')} />
      </FormField>
      <button type="submit" disabled={busy} className="w-full font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-4 hover:bg-sand transition-colors disabled:opacity-60">
        {busy ? 'Sending…' : 'Send Reset Link'}
      </button>
      <p className="text-xs text-center font-sans"><Link href="/auth" className="text-sienna underline underline-offset-2">Back to sign in</Link></p>
    </form>
  )
}

function NewPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const v: Record<string, string> = {}
    const problem = validateNewPassword(password)
    if (problem) v.password = problem
    if (confirm !== password) v.confirm = 'Passwords do not match'
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setBusy(true)
    const res = await post('/api/auth/password-reset/confirm', { token, password })
    setBusy(false)
    if (!res.ok) {
      setFormError(String(res.data?.error ?? `Reset failed (HTTP ${res.status})`))
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div role="status" className="bg-canopy/5 border border-canopy/30 rounded-sm p-6">
        <p className="font-display text-2xl text-ink">Password updated</p>
        <p className="text-sm text-mist font-sans mt-2">For your security, you have been signed out on every device.</p>
        <Link href="/auth" className="inline-block mt-4 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">Sign In</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-parchment border border-sand rounded-sm p-6 space-y-5">
      {formError && (
        <div>
          <FormAlert message={formError} />
          <Link href="/auth/reset" className="inline-block mt-2 text-xs font-sans text-sienna underline underline-offset-2">Request a new link</Link>
        </div>
      )}
      <FormField id="new-password" label="New password" error={errors.password} hint={`At least ${PASSWORD_MIN_LENGTH} characters`}>
        <input id="new-password" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} {...errorProps('new-password', errors.password)} />
      </FormField>
      <FormField id="confirm-password" label="Confirm new password" error={errors.confirm}>
        <input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} {...errorProps('confirm-password', errors.confirm)} />
      </FormField>
      <button type="submit" disabled={busy} className="w-full font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-4 hover:bg-sand transition-colors disabled:opacity-60">
        {busy ? 'Saving…' : 'Set New Password'}
      </button>
    </form>
  )
}
