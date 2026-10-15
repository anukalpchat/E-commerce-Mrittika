'use client'

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import type { ConsentRecord, PublicUser } from './auth-types'

interface AuthContextValue {
  user: PublicUser | null
  consents: ConsentRecord[]
  status: 'loading' | 'ready'
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (!res.ok) throw new Error(`GET /api/auth/me returned HTTP ${res.status}`)
      const data: { user: PublicUser | null; consents: ConsentRecord[] } = await res.json()
      setUser(data.user)
      setConsents(data.consents)
    } catch (err) {
      // Render path: fall back to signed-out UI rather than breaking every page's header.
      console.error('Could not load the current session', err)
      setUser(null)
      setConsents([])
    } finally {
      setStatus('ready')
    }
  }, [])

  const signOut = useCallback(async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' })
    if (!res.ok) throw new Error(`Sign out failed (HTTP ${res.status}). Please try again.`)
    setUser(null)
    setConsents([])
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, consents, status, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
