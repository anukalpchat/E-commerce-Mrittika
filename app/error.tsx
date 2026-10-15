'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Page failed to render', error)
  }, [error])

  return (
    <main className="min-h-[70vh] bg-vellum flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-lg">
        <h1 className="font-display text-4xl text-ink">Something went wrong on our side</h1>
        <p className="text-sm text-mist font-sans mt-3">
          The page could not be loaded. Your cart and account are safe. Please try again; if it keeps happening, let us know.
        </p>
        {error.digest && <p className="text-xs text-mist font-mono mt-3">Reference: {error.digest}</p>}
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button type="button" onClick={reset} className="font-sans text-xs uppercase tracking-widest bg-gold text-forest px-6 py-3 hover:bg-sand">
            Try Again
          </button>
          <Link href="/contact" className="font-sans text-xs uppercase tracking-widest border border-sand text-ink px-6 py-3 hover:border-gold">
            Contact Support
          </Link>
        </div>
      </div>
    </main>
  )
}
