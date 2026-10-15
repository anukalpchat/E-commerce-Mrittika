import type { Metadata } from 'next'
import { Suspense } from 'react'
import AuthClient from './AuthClient'

export const metadata: Metadata = { title: 'Sign In / Register' }

export default function AuthPage() {
  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-gold font-sans text-xs uppercase tracking-widest mb-2">Account</p>
          <h1 className="font-display text-4xl text-ink">Your Mrittika Account</h1>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-6 py-12">
        <Suspense fallback={<AuthSkeleton />}>
          <AuthClient />
        </Suspense>
      </div>
    </main>
  )
}

function AuthSkeleton() {
  return <div className="h-96 bg-parchment border border-sand rounded-sm animate-pulse" aria-hidden="true" />
}
