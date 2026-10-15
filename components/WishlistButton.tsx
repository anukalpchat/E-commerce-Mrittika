'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

interface Props {
  slug: string
  /** Known initial state (e.g. on the wishlist page) skips the lookup request. */
  initiallySaved?: boolean
  /** Called after a successful removal, so a wishlist view can drop the item. */
  onRemoved?: () => void
  variant?: 'full' | 'compact'
}

export default function WishlistButton({ slug, initiallySaved, onRemoved, variant = 'full' }: Props) {
  const router = useRouter()
  const { user, status } = useAuth()
  const [saved, setSaved] = useState(initiallySaved ?? false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user || initiallySaved !== undefined) return
    fetch('/api/wishlist', { cache: 'no-store' })
      .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((data: { slugs: string[] }) => setSaved(data.slugs.includes(slug)))
      .catch(err => console.error('Could not load wishlist state', err))
  }, [user, slug, initiallySaved])

  async function toggle() {
    if (!user) {
      router.push(`/auth?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/wishlist', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setSaved(!saved)
      if (saved) onRemoved?.()
    } catch {
      setError('Could not update your wishlist. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const label = saved ? 'Saved to wishlist' : 'Save to wishlist'
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={toggle}
        disabled={busy || status === 'loading'}
        aria-pressed={saved}
        aria-label={variant === 'compact' ? (saved ? 'Remove from wishlist' : 'Save to wishlist') : undefined}
        className={`font-sans text-sm transition-colors disabled:opacity-50 ${
          variant === 'compact'
            ? 'text-xs text-sienna underline underline-offset-2 hover:text-ink'
            : `flex items-center gap-2 border px-4 py-2.5 ${saved ? 'border-sienna/50 text-sienna bg-sienna/5' : 'border-sand text-mist hover:text-ink hover:border-gold'}`
        }`}
      >
        {variant === 'compact' ? (saved ? 'Remove' : 'Save') : (
          <>
            <span aria-hidden="true">{saved ? '♥' : '♡'}</span>
            {label}
          </>
        )}
      </button>
      {error && <span role="alert" className="mt-1 text-xs text-sienna font-sans">{error}</span>}
    </span>
  )
}
