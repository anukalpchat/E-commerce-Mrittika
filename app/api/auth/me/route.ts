import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/server/auth'
import { listConsentsForUser } from '@/lib/server/consent'

export const dynamic = 'force-dynamic'

// Signed-out is a normal state for this endpoint, so it answers 200 with user: null rather than 401.
export async function GET() {
  const user = getCurrentUser()
  if (!user) return NextResponse.json({ user: null, consents: [] })
  return NextResponse.json({ user, consents: listConsentsForUser(user.id) })
}
