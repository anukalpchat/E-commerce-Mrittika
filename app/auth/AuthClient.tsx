'use client'

import { FormEvent, ReactNode, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { ApiError } from '@/lib/auth-types'
import {
  FieldErrors,
  PASSWORD_MIN_LENGTH,
  safeRedirectPath,
  validateLogin,
  validateRegistration,
} from '@/lib/auth-validation'
import { TERMS_LAST_UPDATED } from '@/lib/legal'

type Tab = 'login' | 'register'

export default function AuthClient() {
  const { user, status } = useAuth()
  const params = useSearchParams()
  const [tab, setTab] = useState<Tab>(params.get('tab') === 'register' ? 'register' : 'login')
  const next = safeRedirectPath(params.get('next'))

  if (status === 'loading') {
    return <div className="h-96 bg-parchment border border-sand rounded-sm animate-pulse" aria-hidden="true" />
  }
  if (user) return <SignedInView />

  return (
    <div className="bg-parchment border border-sand rounded-sm">
      <div role="tablist" aria-label="Sign in or register" className="grid grid-cols-2 border-b border-sand">
        <TabButton active={tab === 'login'} onClick={() => setTab('login')} controls="panel-login">
          Sign In
        </TabButton>
        <TabButton active={tab === 'register'} onClick={() => setTab('register')} controls="panel-register">
          Create Account
        </TabButton>
      </div>
      <div className="p-6 md:p-8">
        {tab === 'login' ? (
          <LoginForm next={next} onSwitch={() => setTab('register')} />
        ) : (
          <RegisterForm next={next} onSwitch={() => setTab('login')} />
        )}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, controls, children }: { active: boolean; onClick: () => void; controls: string; children: ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={`py-4 text-xs font-sans uppercase tracking-widest transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
        active ? 'bg-vellum text-ink border-b-2 border-gold -mb-px' : 'text-mist hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

async function postJson(url: string, body: unknown): Promise<{ ok: true } | { ok: false; error: ApiError }> {
  let res: Response
  try {
    res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    return { ok: false, error: { error: 'Could not reach the server. Check your connection and try again.' } }
  }
  if (res.ok) return { ok: true }
  try {
    return { ok: false, error: (await res.json()) as ApiError }
  } catch {
    return { ok: false, error: { error: `Something went wrong on our side (HTTP ${res.status}). Please try again.` } }
  }
}

function useAfterAuth(next: string | null) {
  const { refresh } = useAuth()
  const router = useRouter()
  return async () => {
    await refresh()
    if (next) router.push(next)
  }
}

function LoginForm({ next, onSwitch }: { next: string | null; onSwitch: () => void }) {
  const afterAuth = useAfterAuth(next)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const errors = validateLogin({ email, password })
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    const result = await postJson('/api/auth/login', { email, password })
    setSubmitting(false)
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors ?? {})
      setFormError(result.error.error)
      return
    }
    await afterAuth()
  }

  return (
    <form id="panel-login" role="tabpanel" onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <FormAlert message={formError} />}
      <Field id="login-email" label="Email" error={fieldErrors.email}>
        <input id="login-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} {...inputProps('login-email', fieldErrors.email)} />
      </Field>
      <Field id="login-password" label="Password" error={fieldErrors.password}>
        <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} {...inputProps('login-password', fieldErrors.password)} />
      </Field>
      <SubmitButton submitting={submitting} label="Sign In" busyLabel="Signing in…" />
      <p className="text-xs text-mist font-sans text-center">
        New to Mrittika?{' '}
        <button type="button" onClick={onSwitch} className="text-sienna underline underline-offset-2 hover:text-ink">
          Create an account
        </button>
      </p>
    </form>
  )
}

function RegisterForm({ next, onSwitch }: { next: string | null; onSwitch: () => void }) {
  const afterAuth = useAfterAuth(next)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const payload = { ...form, acceptTerms }
    const errors = validateRegistration(payload)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    const result = await postJson('/api/auth/register', payload)
    setSubmitting(false)
    if (!result.ok) {
      setFieldErrors(result.error.fieldErrors ?? {})
      setFormError(result.error.error)
      return
    }
    await afterAuth()
  }

  return (
    <form id="panel-register" role="tabpanel" onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && <FormAlert message={formError} />}
      <Field id="reg-name" label="Full Name" error={fieldErrors.name}>
        <input id="reg-name" autoComplete="name" value={form.name} onChange={e => update('name', e.target.value)} {...inputProps('reg-name', fieldErrors.name)} />
      </Field>
      <Field id="reg-email" label="Email" error={fieldErrors.email}>
        <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} {...inputProps('reg-email', fieldErrors.email)} />
      </Field>
      <Field id="reg-phone" label="Mobile (optional)" error={fieldErrors.phone}>
        <input
          id="reg-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="10-digit mobile"
          value={form.phone}
          onChange={e => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
          {...inputProps('reg-phone', fieldErrors.phone)}
        />
      </Field>
      <Field id="reg-password" label="Password" error={fieldErrors.password} hint={`At least ${PASSWORD_MIN_LENGTH} characters`}>
        <input id="reg-password" type="password" autoComplete="new-password" value={form.password} onChange={e => update('password', e.target.value)} {...inputProps('reg-password', fieldErrors.password)} />
      </Field>

      <div className="bg-vellum border border-sand rounded-sm p-4">
        <label htmlFor="reg-terms" className="flex items-start gap-3 cursor-pointer">
          <input
            id="reg-terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={e => setAcceptTerms(e.target.checked)}
            aria-invalid={!!fieldErrors.acceptTerms}
            aria-describedby={fieldErrors.acceptTerms ? 'reg-terms-error' : undefined}
            className="mt-0.5 accent-canopy shrink-0 w-4 h-4"
          />
          <span className="text-xs font-sans text-mist leading-relaxed">
            I confirm I am at least 18 years old and I have read and agree to the{' '}
            <Link href="/terms" target="_blank" className="text-gold underline">Terms &amp; Conditions</Link>{' '}
            (last updated {TERMS_LAST_UPDATED}).
          </span>
        </label>
        {fieldErrors.acceptTerms && (
          <p id="reg-terms-error" className="mt-2 text-xs text-sienna font-sans">{fieldErrors.acceptTerms}</p>
        )}
      </div>

      <SubmitButton submitting={submitting} label="Create Account" busyLabel="Creating account…" />
      <p className="text-xs text-mist font-sans text-center">
        Already have an account?{' '}
        <button type="button" onClick={onSwitch} className="text-sienna underline underline-offset-2 hover:text-ink">
          Sign in
        </button>
      </p>
    </form>
  )
}

function SignedInView() {
  const { user, consents, signOut } = useAuth()
  const router = useRouter()
  const [signOutError, setSignOutError] = useState('')
  if (!user) return null

  async function handleSignOut() {
    setSignOutError('')
    try {
      await signOut()
      router.refresh()
    } catch (err) {
      setSignOutError(err instanceof Error ? err.message : 'Sign out failed. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-parchment border border-sand rounded-sm p-6 md:p-8">
        <p className="text-xs font-sans text-gold uppercase tracking-widest mb-1">Signed in</p>
        <h2 className="font-display text-3xl text-ink">{user.name}</h2>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm font-sans">
          <dt className="text-mist">Email</dt>
          <dd className="text-ink break-all">{user.email}</dd>
          <dt className="text-mist">Mobile</dt>
          <dd className="text-ink">{user.phone ?? '—'}</dd>
          <dt className="text-mist">Account type</dt>
          <dd className="text-ink capitalize">{user.role}</dd>
          <dt className="text-mist">Member since</dt>
          <dd className="text-ink">{formatDateTime(user.createdAt)}</dd>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/categories" className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors">
            Continue Shopping
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold transition-colors"
          >
            Sign Out
          </button>
        </div>
        {signOutError && <p role="alert" className="mt-3 text-xs text-sienna font-sans">{signOutError}</p>}
      </div>

      <div className="bg-parchment border border-sand rounded-sm p-6 md:p-8">
        <h3 className="font-display text-xl text-ink">Your consent records</h3>
        <p className="mt-1 text-xs text-mist font-sans">
          Stored on our server each time you accept a policy. Kept as evidence of what you agreed to and when.
        </p>
        {consents.length === 0 ? (
          <p className="mt-4 text-sm text-mist font-sans">No consent records yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs font-sans">
              <thead>
                <tr className="text-left text-mist uppercase tracking-widest border-b border-sand">
                  <th className="py-2 pr-4 font-normal">Policy</th>
                  <th className="py-2 pr-4 font-normal">Version</th>
                  <th className="py-2 pr-4 font-normal">Given at</th>
                  <th className="py-2 font-normal">Accepted</th>
                </tr>
              </thead>
              <tbody>
                {consents.map(c => (
                  <tr key={c.id} className="border-b border-sand/60 text-ink">
                    <td className="py-2 pr-4 capitalize">{c.policy === 'terms' ? 'Terms & Conditions' : c.policy}</td>
                    <td className="py-2 pr-4 font-mono">{c.policyVersion}</td>
                    <td className="py-2 pr-4 capitalize">{c.context.replace('-', ' ')}</td>
                    <td className="py-2">{formatDateTime(c.acceptedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-sienna font-sans">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-mist font-sans">{hint}</p>
      ) : null}
    </div>
  )
}

function inputProps(id: string, error?: string) {
  return {
    'aria-invalid': !!error,
    'aria-describedby': error ? `${id}-error` : undefined,
    className: `w-full text-sm font-sans border rounded-sm px-3 py-2 bg-vellum text-ink focus:outline-none transition-colors ${
      error ? 'border-sienna focus:border-sienna' : 'border-sand focus:border-gold'
    }`,
  }
}

function FormAlert({ message }: { message: string }) {
  return (
    <div role="alert" className="border border-sienna/40 bg-sienna/5 text-sienna text-xs font-sans rounded-sm px-4 py-3">
      {message}
    </div>
  )
}

function SubmitButton({ submitting, label, busyLabel }: { submitting: boolean; label: string; busyLabel: string }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="w-full font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-4 hover:bg-sand transition-colors disabled:opacity-60 disabled:cursor-wait"
    >
      {submitting ? busyLabel : label}
    </button>
  )
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
