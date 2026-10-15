import type { Metadata } from 'next'
import { Suspense } from 'react'
import ResetClient from './ResetClient'

export const metadata: Metadata = { title: 'Reset Password' }

export default function ResetPage() {
  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-2">Account</p>
          <h1 className="font-display text-4xl text-ink">Reset your password</h1>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-6 py-12">
        <Suspense fallback={<div className="h-64 bg-parchment border border-sand rounded-sm animate-pulse" aria-hidden="true" />}>
          <ResetClient />
        </Suspense>
      </div>
    </main>
  )
}
