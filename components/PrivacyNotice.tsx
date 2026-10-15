'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const STORAGE_KEY = 'mrittika_privacy_notice_seen'

// Informational, not a consent prompt: the site sets only an essential sign-in cookie, which needs no consent.
export default function PrivacyNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(localStorage.getItem(STORAGE_KEY) !== '1')
    } catch {
      // Storage blocked (private mode, strict settings): show the notice every visit rather than never.
      setVisible(true)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Nothing to persist to; the notice simply returns next visit.
    }
  }

  if (!visible) return null

  return (
    <div role="region" aria-label="Privacy notice" className="fixed bottom-0 inset-x-0 z-40 no-print">
      <div className="max-w-4xl mx-auto m-3 bg-forest text-sand border border-canopy/50 rounded-sm shadow-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <p className="text-xs font-sans leading-relaxed flex-1">
          We use one essential cookie to keep you signed in, and keep your cart in this browser. No tracking or advertising cookies.{' '}
          <Link href="/privacy#cookies" className="text-gold underline underline-offset-2">Privacy Policy</Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 font-sans text-xs uppercase tracking-widest bg-gold text-forest px-5 py-2 hover:bg-sand transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
