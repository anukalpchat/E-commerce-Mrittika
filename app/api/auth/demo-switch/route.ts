import { NextResponse } from 'next/server'
import { returnFromDemoAccount, switchToDemoAccount } from '@/lib/server/auth'
import { getDb } from '@/lib/server/db'
import { errorResponse, readJsonObject, stringField } from '@/lib/server/http'
import { DEMO_ACCOUNTS, DEMO_MODE } from '@/lib/server/seed'

type Target = keyof typeof DEMO_ACCOUNTS | 'return'

const LANDING: Record<Target, string> = {
  buyer: '/account',
  vendor: '/vendor/dashboard',
  admin: '/admin',
  return: '/account',
}

// One-click sign-in to the seeded demo accounts, for presenting the project. Disabled outside demo mode,
// where it answers 404 so the endpoint is indistinguishable from one that does not exist.
export async function POST(request: Request) {
  if (!DEMO_MODE) return errorResponse(404, 'Not found')

  const body = await readJsonObject(request)
  const target = (body ? stringField(body, 'account') : '') as Target
  if (!(target in LANDING)) return errorResponse(400, `account must be one of: ${Object.keys(LANDING).join(', ')}`)

  if (target === 'return') {
    if (!returnFromDemoAccount()) return errorResponse(400, 'There is no account to return to. Sign in normally.')
    return NextResponse.json({ redirectTo: LANDING.return })
  }

  const row = getDb().prepare(`SELECT id FROM users WHERE email = ?`).get(DEMO_ACCOUNTS[target].email)
  if (!row) throw new Error(`Demo account ${DEMO_ACCOUNTS[target].email} is missing; restart the server to re-seed it`)
  switchToDemoAccount(Number(row.id), Object.values(DEMO_ACCOUNTS).map(a => a.email))
  return NextResponse.json({ redirectTo: LANDING[target] })
}
