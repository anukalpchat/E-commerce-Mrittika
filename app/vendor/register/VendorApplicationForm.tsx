'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { errorProps, FormAlert, FormField, inputClass } from '@/components/FormField'
import { TERMS_LAST_UPDATED } from '@/lib/legal'
import { INDIAN_STATES } from '@/lib/orders-shared'
import { CATEGORY_OPTIONS, validateVendorApplication, Vendor, VendorApplicationInput } from '@/lib/vendor-shared'

export default function VendorApplicationForm({ previous }: { previous: Vendor | null }) {
  const router = useRouter()
  const [form, setForm] = useState<VendorApplicationInput>({
    businessName: previous?.businessName ?? '',
    city: previous?.city ?? '',
    state: previous?.state ?? '',
    gstin: previous?.gstin ?? '',
    contactPhone: previous?.contactPhone ?? '',
    categories: previous?.categories ?? [],
    description: previous?.description ?? '',
    practices: previous?.practices ?? '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof VendorApplicationInput>(key: K, value: VendorApplicationInput[K]) => {
    setForm(f => ({ ...f, [key]: value }))
    // Clear the field's error as soon as it is edited, so stale messages do not sit under corrected input.
    setErrors(({ [key]: _cleared, ...rest }) => rest)
  }
  const toggleCategory = (value: string) =>
    set('categories', form.categories.includes(value) ? form.categories.filter(c => c !== value) : [...form.categories, value])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const v = validateVendorApplication(form)
    setErrors(v)
    if (Object.keys(v).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/vendor/application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setErrors(data?.fieldErrors ?? {})
        setFormError(data?.error ?? `Could not submit (HTTP ${res.status})`)
        return
      }
      router.refresh()
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-parchment border border-sand rounded-sm p-6 md:p-8 space-y-5">
      {formError && <FormAlert message={formError} />}

      <FormField id="v-name" label="Registered business name" error={errors.businessName}>
        <input id="v-name" autoComplete="organization" value={form.businessName} onChange={e => set('businessName', e.target.value)} {...errorProps('v-name', errors.businessName)} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="v-city" label="City" error={errors.city}>
          <input id="v-city" value={form.city} onChange={e => set('city', e.target.value)} {...errorProps('v-city', errors.city)} />
        </FormField>
        <FormField id="v-state" label="State" error={errors.state}>
          <select id="v-state" value={form.state} onChange={e => set('state', e.target.value)} {...errorProps('v-state', errors.state)}>
            <option value="">Select state…</option>
            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="v-gstin" label="GSTIN" error={errors.gstin} hint="15 characters, e.g. 33ABCDE1234F1Z5">
          <input
            id="v-gstin"
            value={form.gstin}
            onChange={e => set('gstin', e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 15))}
            {...errorProps('v-gstin', errors.gstin)}
            className={`${inputClass(!!errors.gstin)} font-mono`}
          />
        </FormField>
        <FormField id="v-phone" label="Business mobile" error={errors.contactPhone}>
          <input
            id="v-phone"
            type="tel"
            inputMode="numeric"
            value={form.contactPhone}
            onChange={e => set('contactPhone', e.target.value.replace(/\D/g, '').slice(0, 10))}
            {...errorProps('v-phone', errors.contactPhone)}
          />
        </FormField>
      </div>

      <fieldset>
        <legend className="block text-xs font-sans text-gold uppercase tracking-widest mb-2">What will you sell?</legend>
        <div className="flex flex-wrap gap-3">
          {CATEGORY_OPTIONS.map(c => (
            <label key={c.value} className="flex items-center gap-2 text-sm font-sans text-ink border border-sand bg-vellum rounded-sm px-3 py-2 cursor-pointer">
              <input type="checkbox" checked={form.categories.includes(c.value)} onChange={() => toggleCategory(c.value)} className="accent-canopy" />
              {c.label}
            </label>
          ))}
        </div>
        {errors.categories && <p className="mt-1 text-xs text-sienna font-sans">{errors.categories}</p>}
      </fieldset>

      <FormField id="v-desc" label="About your business" error={errors.description} hint="Who you are, what you make, who makes it.">
        <textarea id="v-desc" rows={4} value={form.description} onChange={e => set('description', e.target.value)} {...errorProps('v-desc', errors.description)} />
      </FormField>

      <FormField id="v-practices" label="Sustainability practices & certifications" error={errors.practices} hint="Materials, sourcing, packaging, certifications held. We review these before approval.">
        <textarea id="v-practices" rows={4} value={form.practices} onChange={e => set('practices', e.target.value)} {...errorProps('v-practices', errors.practices)} />
      </FormField>

      <div className="bg-vellum border border-sand rounded-sm p-4">
        <label htmlFor="v-terms" className="flex items-start gap-3 cursor-pointer">
          <input
            id="v-terms"
            type="checkbox"
            checked={form.acceptTerms}
            onChange={e => set('acceptTerms', e.target.checked)}
            aria-invalid={!!errors.acceptTerms}
            className="mt-0.5 accent-canopy shrink-0 w-4 h-4"
          />
          <span className="text-xs font-sans text-mist leading-relaxed">
            I am authorised to act for this business, the details above are accurate, and I agree to the{' '}
            <Link href="/terms" target="_blank" className="text-gold underline">Terms &amp; Conditions</Link> (last updated {TERMS_LAST_UPDATED}),
            including the vendor obligations on listing accuracy and sustainability documentation.
          </span>
        </label>
        {errors.acceptTerms && <p className="mt-2 text-xs text-sienna font-sans">{errors.acceptTerms}</p>}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full font-sans text-sm uppercase tracking-widest bg-gold text-forest px-6 py-4 hover:bg-sand transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : previous ? 'Resubmit Application' : 'Submit Application'}
      </button>
    </form>
  )
}
