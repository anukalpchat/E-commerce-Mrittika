'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import DemoSwitcher from './DemoSwitcher'

export default function AccountMenu() {
  const { user, status, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const buttonCls = 'text-xs font-sans uppercase tracking-widest border border-gold/60 text-gold hover:bg-gold hover:text-forest transition-colors px-4 py-1.5'

  if (status === 'loading') return <span className={`${buttonCls} invisible`} aria-hidden="true">Sign In</span>
  if (!user) return <Link href="/auth" className={buttonCls}>Sign In</Link>

  async function handleSignOut() {
    try {
      await signOut()
    } finally {
      window.location.href = '/'
    }
  }

  const linkCls = 'block px-3 py-2 text-sm font-sans text-ink rounded-sm hover:bg-sand/40'

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        className={`${buttonCls} flex items-center gap-2`}
      >
        {user.name.split(' ')[0]}
        <span aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-vellum border border-sand rounded-sm shadow-xl z-50 p-2 text-left">
          <div className="px-3 py-2 border-b border-sand mb-1">
            <p className="text-sm font-sans text-ink font-medium truncate">{user.name}</p>
            <p className="text-xs font-sans text-mist truncate">{user.email} · <span className="capitalize">{user.role}</span></p>
          </div>
          <nav aria-label="Account">
            <Link href="/account" className={linkCls}>My Account</Link>
            <Link href="/account?tab=orders" className={linkCls}>My Orders</Link>
            <Link href="/account/impact" className={linkCls}>My Impact</Link>
            {user.role === 'vendor' && <Link href="/vendor/dashboard" className={linkCls}>Vendor Dashboard</Link>}
            {user.role === 'admin' && <Link href="/admin" className={linkCls}>Admin Panel</Link>}
          </nav>
          <div className="border-t border-sand mt-1 pt-2">
            <DemoSwitcher />
          </div>
          <div className="border-t border-sand mt-1 pt-1">
            <button type="button" onClick={handleSignOut} className={`${linkCls} w-full text-left text-sienna`}>Sign Out</button>
          </div>
        </div>
      )}
    </div>
  )
}
