'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import { errorProps, FormAlert, FormField, inputClass } from '@/components/FormField'
import { formatDateTime } from '@/lib/format'
import { SUPPORT_TOPICS, SupportInput, validateSupport } from '@/lib/support-shared'

export default function ContactForm({ defaultName, defaultEmail }: { defaultName: string; defaultEmail: string }) {
  const empty: SupportInput = { name: defaultName, email: defaultEmail, topic: '', orderId: '', message: '' }
  const [form, setForm] = useState<SupportInput>(empty)
  const [website, setWebsite] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<{ id: string; acknowledgeBy: string } | null>(null)

  const set = (key: keyof SupportInput) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(({ [key]: _cleared, ...rest }) => rest)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const v = validateSupport(form)
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSending(true)
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setErrors(data?.fieldErrors ?? {})
        setFormError(data?.error ?? `Could not send (HTTP ${res.status})`)
        return
      }
      setSent(data.ticket)
      setForm(empty)
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div role="status" className="bg-canopy/5 border border-canopy/30 rounded-sm p-6">
        <p className="font-display text-2xl text-ink">Message received</p>
        <p className="text-sm font-sans text-ink mt-2">
          Your ticket number is <span className="font-mono font-medium">{sent.id}</span>. Quote it if you write to us again.
        </p>
        {sent.acknowledgeBy && (
          <p className="text-xs font-sans text-mist mt-1">We will reply by {formatDateTime(sent.acknowledgeBy)}.</p>
        )}
        <button type="button" onClick={() => setSent(null)} className="mt-4 text-xs font-sans text-sienna underline underline-offset-2">
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-parchment border border-sand rounded-sm p-6 space-y-5">
      {formError && <FormAlert message={formError} />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="c-name" label="Your name" error={errors.name}>
          <input id="c-name" autoComplete="name" value={form.name} onChange={set('name')} {...errorProps('c-name', errors.name)} />
        </FormField>
        <FormField id="c-email" label="Email" error={errors.email}>
          <input id="c-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} {...errorProps('c-email', errors.email)} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="c-topic" label="What is this about?" error={errors.topic}>
          <select id="c-topic" value={form.topic} onChange={set('topic')} {...errorProps('c-topic', errors.topic)}>
            <option value="">Choose…</option>
            {SUPPORT_TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </FormField>
        <FormField id="c-order" label="Order ID (optional)" error={errors.orderId} hint="e.g. MRT-AB23CD45">
          <input id="c-order" value={form.orderId} onChange={set('orderId')} {...errorProps('c-order', errors.orderId)} className={`${inputClass(!!errors.orderId)} font-mono`} />
        </FormField>
      </div>
      <FormField id="c-message" label="Message" error={errors.message}>
        <textarea id="c-message" rows={6} value={form.message} onChange={set('message')} {...errorProps('c-message', errors.message)} />
      </FormField>
      {/* Honeypot for bots: hidden from sighted users and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
      </div>
      <p className="text-xs text-mist font-sans">
        We use these details only to answer you, as described in our Privacy Policy.
      </p>
      <button
        type="submit"
        disabled={sending}
        className="font-sans text-sm uppercase tracking-widest bg-gold text-forest px-8 py-3 hover:bg-sand transition-colors disabled:opacity-60"
      >
        {sending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
