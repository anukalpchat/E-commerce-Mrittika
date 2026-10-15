import { NextResponse } from 'next/server'
import { demoOriginUser, getCurrentUser } from '@/lib/server/auth'
import { listConsentsForUser } from '@/lib/server/consent'
import { DEMO_MODE } from '@/lib/server/seed'

export const dynamic = 'force-dynamic'

// Signed-out is a normal state for this endpoint, so it answers 200 with user: null rather than 401.
export async function GET() {
  const user = getCurrentUser()
  const demo = DEMO_MODE ? { enabled: true, returnTo: demoOriginUser()?.name ?? null } : { enabled: false, returnTo: null }
  if (!user) return NextResponse.json({ user: null, consents: [], demo })
  return NextResponse.json({ user, consents: listConsentsForUser(user.id), demo })
}
