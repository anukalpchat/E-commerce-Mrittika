'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { useAuth } from '@/lib/auth-context'

const nav = [
  { label: 'Shop', href: '/categories' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Journal', href: '/journal' },
  { label: 'About', href: '/about' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const { itemCount } = useCart()
  const { user, status } = useAuth()
  const accountLabel = user ? user.name.split(' ')[0] : 'Sign In'
  const accountHref = user ? '/account' : '/auth'
  // Hidden (not removed) while the session loads so the header does not shift when it resolves.
  const accountVisibility = status === 'loading' ? 'invisible' : ''

  return (
    <header className="bg-forest text-vellum border-b border-canopy/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-display text-2xl font-light tracking-wide text-gold shrink-0"
        >
          Mrittika
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sand text-sm font-sans hover:text-vellum transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/search"
            className="hidden md:block text-sand hover:text-vellum text-sm transition-colors"
            aria-label="Search"
          >
            Search
          </Link>
          <Link
            href="/cart"
            className="hidden md:flex items-center gap-1.5 text-sand hover:text-vellum text-sm transition-colors"
          >
            Cart
            {itemCount > 0 && (
              <span className="bg-gold text-forest text-xs font-sans font-medium rounded-full w-5 h-5 flex items-center justify-center leading-none">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          <Link
            href={accountHref}
            className={`hidden md:inline-block text-xs font-sans uppercase tracking-widest border border-gold/60 text-gold hover:bg-gold hover:text-forest transition-colors px-4 py-1.5 ${accountVisibility}`}
            aria-label={user ? `Account for ${user.name}` : 'Sign in'}
          >
            {accountLabel}
          </Link>
          {/* Mobile toggle */}
          <button
            className="md:hidden text-sand hover:text-vellum text-xl leading-none"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden bg-forest border-t border-canopy/30">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block px-6 py-3.5 text-sand hover:text-vellum text-sm border-b border-canopy/20"
              onClick={() => setOpen(false)}
            >
              {n.label}
            </Link>
          ))}
          <div className="px-6 py-4 flex items-center gap-6">
            <Link href="/search" className="text-sand text-sm hover:text-vellum" onClick={() => setOpen(false)}>
              Search
            </Link>
            <Link href="/cart" className="flex items-center gap-1.5 text-sand text-sm hover:text-vellum" onClick={() => setOpen(false)}>
              Cart
              {itemCount > 0 && (
                <span className="bg-gold text-forest text-xs font-sans font-medium rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <Link href={accountHref} className={`text-gold text-sm font-medium hover:text-vellum ${accountVisibility}`} onClick={() => setOpen(false)}>
              {accountLabel}
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
