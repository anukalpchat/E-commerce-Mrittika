import Link from 'next/link'
import type { ReactNode } from 'react'
import type { PublicUser } from '@/lib/auth-types'
import { formatDate } from '@/lib/format'
import SignOutButton from './SignOutButton'

export type AccountSection = 'profile' | 'orders' | 'addresses' | 'wishlist' | 'privacy' | 'impact'

const SECTIONS: { id: AccountSection; label: string; href: string }[] = [
  { id: 'profile', label: 'Profile', href: '/account' },
  { id: 'orders', label: 'Orders', href: '/account?tab=orders' },
  { id: 'impact', label: 'My Impact', href: '/account/impact' },
  { id: 'addresses', label: 'Addresses', href: '/account?tab=addresses' },
  { id: 'wishlist', label: 'Wishlist', href: '/account?tab=wishlist' },
  { id: 'privacy', label: 'Consent Records', href: '/account?tab=privacy' },
]

export default function AccountShell({ user, active, children }: { user: PublicUser; active: AccountSection; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-vellum">
      <div className="bg-parchment border-b border-sand">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-gold font-sans text-xs uppercase tracking-widest mb-1">My Account</p>
            <h1 className="font-display text-4xl text-ink">Hello, {user.name.split(' ')[0]}</h1>
            <p className="text-xs text-mist font-sans mt-1">Member since {formatDate(user.createdAt)}</p>
          </div>
          <SignOutButton />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        <nav aria-label="Account sections" className="md:w-52 shrink-0">
          <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-1 px-1 pb-2 md:pb-0">
            {SECTIONS.map(s => (
              <li key={s.id} className="shrink-0">
                <Link
                  href={s.href}
                  aria-current={s.id === active ? 'page' : undefined}
                  className={`block text-sm font-sans px-3 py-2 rounded-sm whitespace-nowrap transition-colors ${
                    s.id === active ? 'bg-forest text-vellum' : 'text-mist hover:text-ink hover:bg-parchment'
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          {(user.role === 'vendor' || user.role === 'admin') && (
            <Link
              href={user.role === 'admin' ? '/admin' : '/vendor/dashboard'}
              className="mt-4 hidden md:block text-xs font-sans uppercase tracking-widest border border-gold/60 text-gold px-3 py-2 rounded-sm hover:bg-gold hover:text-forest transition-colors"
            >
              {user.role === 'admin' ? 'Admin Panel →' : 'Vendor Dashboard →'}
            </Link>
          )}
        </nav>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </main>
  )
}
