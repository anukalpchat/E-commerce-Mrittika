'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function SignOutButton() {
  const { signOut } = useAuth()
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleClick() {
    setError('')
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed. Please try again.')
    }
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleClick}
        className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-5 py-2.5 hover:border-gold transition-colors"
      >
        Sign Out
      </button>
      {error && <p role="alert" className="mt-2 text-xs text-sienna font-sans">{error}</p>}
    </div>
  )
}
