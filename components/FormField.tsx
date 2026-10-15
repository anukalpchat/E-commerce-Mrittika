import type { ReactNode } from 'react'

export function FormField({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
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

export function inputClass(hasError: boolean): string {
  return `w-full text-sm font-sans border rounded-sm px-3 py-2 bg-vellum text-ink focus:outline-none transition-colors ${
    hasError ? 'border-sienna focus:border-sienna' : 'border-sand focus:border-gold'
  }`
}

export function errorProps(id: string, error?: string) {
  return { 'aria-invalid': !!error, 'aria-describedby': error ? `${id}-error` : undefined, className: inputClass(!!error) }
}

export function FormAlert({ message }: { message: string }) {
  return (
    <p role="alert" className="border border-sienna/40 bg-sienna/5 text-sienna text-xs font-sans rounded-sm px-4 py-3">
      {message}
    </p>
  )
}
