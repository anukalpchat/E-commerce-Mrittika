import type { ReactNode } from 'react'
import { AddressInput, INDIAN_STATES } from '@/lib/orders-shared'

export default function AddressForm({
  address,
  onChange,
  errors,
  saveAddress,
  onSaveChange,
}: {
  address: AddressInput
  onChange: (a: AddressInput) => void
  errors: Record<string, string>
  /** Omit to hide the "save to my account" checkbox (e.g. when the form is already the address book). */
  saveAddress?: boolean
  onSaveChange?: (v: boolean) => void
}) {
  const set = (key: keyof AddressInput, value: string) => onChange({ ...address, [key]: value })
  return (
    <div className="bg-parchment border border-sand rounded-sm p-6 space-y-4">
      <Field id="addr-name" label="Full Name" error={errors.name}>
        <input id="addr-name" autoComplete="name" value={address.name} onChange={e => set('name', e.target.value)} placeholder="As on ID / delivery receipt" className={inputCls(!!errors.name)} />
      </Field>
      <Field id="addr-phone" label="Mobile Number" error={errors.phone}>
        <input id="addr-phone" type="tel" autoComplete="tel-national" inputMode="numeric" value={address.phone} onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit mobile" className={inputCls(!!errors.phone)} />
      </Field>
      <Field id="addr-line1" label="Address Line 1" error={errors.line1}>
        <input id="addr-line1" autoComplete="address-line1" value={address.line1} onChange={e => set('line1', e.target.value)} placeholder="House / flat no., building name, street" className={inputCls(!!errors.line1)} />
      </Field>
      <Field id="addr-line2" label="Address Line 2 (optional)" error={errors.line2}>
        <input id="addr-line2" autoComplete="address-line2" value={address.line2} onChange={e => set('line2', e.target.value)} placeholder="Landmark, area" className={inputCls(!!errors.line2)} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="addr-city" label="City" error={errors.city}>
          <input id="addr-city" autoComplete="address-level2" value={address.city} onChange={e => set('city', e.target.value)} placeholder="City" className={inputCls(!!errors.city)} />
        </Field>
        <Field id="addr-pincode" label="Pincode" error={errors.pincode}>
          <input id="addr-pincode" autoComplete="postal-code" inputMode="numeric" value={address.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit PIN" className={inputCls(!!errors.pincode)} />
        </Field>
      </div>
      <Field id="addr-state" label="State" error={errors.state}>
        <select id="addr-state" autoComplete="address-level1" value={address.state} onChange={e => set('state', e.target.value)} className={inputCls(!!errors.state)}>
          <option value="">Select state…</option>
          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      {onSaveChange && (
        <label className="flex items-center gap-2 text-xs font-sans text-mist cursor-pointer">
          <input type="checkbox" checked={saveAddress ?? false} onChange={e => onSaveChange(e.target.checked)} className="accent-canopy" />
          Save this address to my account
        </label>
      )}
    </div>
  )
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-sans text-gold uppercase tracking-widest mb-1.5">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-sienna font-sans">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full text-sm font-sans border rounded-sm px-3 py-2 bg-vellum text-ink focus:outline-none transition-colors ${
    hasError ? 'border-sienna focus:border-sienna' : 'border-sand focus:border-gold'
  }`
}
