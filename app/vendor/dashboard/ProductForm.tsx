'use client'

import { ChangeEvent, FormEvent, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { errorProps, FormAlert, FormField } from '@/components/FormField'
import { CATEGORY_OPTIONS, GST_RATES, ProductInput, splitList, validateProduct, VendorProduct } from '@/lib/vendor-shared'

// Text inputs hold raw strings; they are converted to numbers and lists on submit.
interface Draft {
  name: string
  category: string
  price: string
  gstRate: string
  stockCount: string
  shortDescription: string
  description: string
  materials: string
  certifications: string
  tags: string
  imageUrl: string
  plasticAvoidedG: string
  waterSavedL: string
  wasteDivertedG: string
}

function toDraft(p: VendorProduct | null): Draft {
  return {
    name: p?.name ?? '',
    category: p?.category ?? '',
    price: p ? String(p.price) : '',
    gstRate: p ? String(p.gstRate) : '5',
    stockCount: p ? String(p.stockCount) : '',
    shortDescription: p?.shortDescription ?? '',
    description: p?.description ?? '',
    materials: p?.materials.join(', ') ?? '',
    certifications: p?.certifications.join(', ') ?? '',
    tags: p?.tags.join(', ') ?? '',
    imageUrl: p?.imageUrl ?? '',
    plasticAvoidedG: p ? String(p.plasticAvoidedG) : '0',
    waterSavedL: p ? String(p.waterSavedL) : '0',
    wasteDivertedG: p ? String(p.wasteDivertedG) : '0',
  }
}

function toInput(d: Draft): ProductInput {
  const num = (v: string) => (v.trim() === '' ? Number.NaN : Number(v))
  return {
    name: d.name,
    category: d.category,
    price: num(d.price),
    gstRate: num(d.gstRate),
    stockCount: num(d.stockCount),
    shortDescription: d.shortDescription,
    description: d.description,
    materials: splitList(d.materials),
    certifications: splitList(d.certifications),
    tags: splitList(d.tags),
    imageUrl: d.imageUrl,
    plasticAvoidedG: num(d.plasticAvoidedG),
    waterSavedL: num(d.waterSavedL),
    wasteDivertedG: num(d.wasteDivertedG),
  }
}

export default function ProductForm({ initial, onDone }: { initial: VendorProduct | null; onDone: () => void }) {
  const router = useRouter()
  const [draft, setDraft] = useState<Draft>(toDraft(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const set = (key: keyof Draft) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDraft(d => ({ ...d, [key]: e.target.value }))
    // Clear the field's error as soon as it is edited, so stale messages do not sit under corrected input.
    setErrors(({ [key]: _cleared, ...rest }) => rest)
  }

  async function handleImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErrors(er => ({ ...er, imageUrl: '' }))
    try {
      const body = new FormData()
      body.append('image', file)
      const res = await fetch('/api/uploads', { method: 'POST', body })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setErrors(er => ({ ...er, imageUrl: data?.error ?? `Upload failed (HTTP ${res.status})` }))
        return
      }
      setDraft(d => ({ ...d, imageUrl: data.url }))
    } catch {
      setErrors(er => ({ ...er, imageUrl: 'Could not reach the server. Check your connection and try again.' }))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError('')
    const input = toInput(draft)
    const v = validateProduct(input)
    setErrors(v)
    if (Object.keys(v).length > 0) {
      setFormError('Please fix the highlighted fields')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(initial ? `/api/vendor/products/${initial.id}` : '/api/vendor/products', {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setErrors(data?.fieldErrors ?? {})
        setFormError(data?.error ?? `Could not save (HTTP ${res.status})`)
        return
      }
      router.refresh()
      onDone()
    } catch {
      setFormError('Could not reach the server. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-parchment border border-sand rounded-sm p-6 space-y-5">
      {formError && <FormAlert message={formError} />}

      <FormField id="p-name" label="Product name" error={errors.name}>
        <input id="p-name" value={draft.name} onChange={set('name')} {...errorProps('p-name', errors.name)} />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="p-category" label="Category" error={errors.category}>
          <select id="p-category" value={draft.category} onChange={set('category')} {...errorProps('p-category', errors.category)}>
            <option value="">Choose…</option>
            {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </FormField>
        <FormField id="p-gst" label="GST rate" error={errors.gstRate}>
          <select id="p-gst" value={draft.gstRate} onChange={set('gstRate')} {...errorProps('p-gst', errors.gstRate)}>
            {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
        </FormField>
        <FormField id="p-price" label="Price (₹, incl. GST)" error={errors.price}>
          <input id="p-price" inputMode="numeric" value={draft.price} onChange={set('price')} {...errorProps('p-price', errors.price)} />
        </FormField>
        <FormField id="p-stock" label="Units in stock" error={errors.stockCount}>
          <input id="p-stock" inputMode="numeric" value={draft.stockCount} onChange={set('stockCount')} {...errorProps('p-stock', errors.stockCount)} />
        </FormField>
      </div>

      <FormField id="p-image" label="Product photo" error={errors.imageUrl} hint="JPEG, PNG or WebP, up to 2 MB">
        <div className="flex items-center gap-4">
          {draft.imageUrl && (
            <div className="w-20 h-20 relative rounded-sm overflow-hidden bg-sand/40 shrink-0">
              <Image src={draft.imageUrl} alt="Product photo preview" fill className="object-cover" sizes="80px" />
            </div>
          )}
          <input id="p-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} disabled={uploading} className="text-xs font-sans text-mist" />
          {uploading && <span className="text-xs text-mist font-sans">Uploading…</span>}
        </div>
      </FormField>

      <FormField id="p-short" label="Short description" error={errors.shortDescription} hint="One line shown on product cards (10–160 characters)">
        <input id="p-short" value={draft.shortDescription} onChange={set('shortDescription')} {...errorProps('p-short', errors.shortDescription)} />
      </FormField>
      <FormField id="p-desc" label="Full description" error={errors.description} hint="How it is made, by whom, and why it is a better choice">
        <textarea id="p-desc" rows={5} value={draft.description} onChange={set('description')} {...errorProps('p-desc', errors.description)} />
      </FormField>

      <FormField id="p-materials" label="Materials" error={errors.materials} hint="Comma-separated, e.g. Organic cotton, Natural indigo">
        <input id="p-materials" value={draft.materials} onChange={set('materials')} {...errorProps('p-materials', errors.materials)} />
      </FormField>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField id="p-certs" label="Certifications" hint="Comma-separated; we verify these">
          <input id="p-certs" value={draft.certifications} onChange={set('certifications')} {...errorProps('p-certs')} />
        </FormField>
        <FormField id="p-tags" label="Tags" hint="Comma-separated, e.g. plastic-free, handmade">
          <input id="p-tags" value={draft.tags} onChange={set('tags')} {...errorProps('p-tags')} />
        </FormField>
      </div>

      <fieldset className="border border-sand rounded-sm p-4">
        <legend className="px-1 text-xs font-sans text-gold uppercase tracking-widest">Impact claims per unit</legend>
        <p className="text-xs text-mist font-sans mb-3">
          Compared with the conventional alternative. Shown to buyers as estimates on their impact dashboard. Enter 0 if not applicable.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField id="p-plastic" label="Plastic avoided (g)" error={errors.plasticAvoidedG}>
            <input id="p-plastic" inputMode="numeric" value={draft.plasticAvoidedG} onChange={set('plasticAvoidedG')} {...errorProps('p-plastic', errors.plasticAvoidedG)} />
          </FormField>
          <FormField id="p-water" label="Water saved (L)" error={errors.waterSavedL}>
            <input id="p-water" inputMode="numeric" value={draft.waterSavedL} onChange={set('waterSavedL')} {...errorProps('p-water', errors.waterSavedL)} />
          </FormField>
          <FormField id="p-waste" label="Waste diverted (g)" error={errors.wasteDivertedG}>
            <input id="p-waste" inputMode="numeric" value={draft.wasteDivertedG} onChange={set('wasteDivertedG')} {...errorProps('p-waste', errors.wasteDivertedG)} />
          </FormField>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving || uploading}
          className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Submit for Review'}
        </button>
        <button type="button" onClick={onDone} className="font-sans text-xs uppercase tracking-widest text-mist px-4 py-3 hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  )
}
