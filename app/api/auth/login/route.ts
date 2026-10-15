import { NextResponse } from 'next/server'
import { normaliseEmail, validateLogin } from '@/lib/auth-validation'
import { createSession, getDummyHash, toPublicUser, verifyPassword } from '@/lib/server/auth'
import { getDb } from '@/lib/server/db'
import { errorResponse, readJsonObject, stringField } from '@/lib/server/http'
import { clearAttempts, clientIp, recordAttempt, retryAfter } from '@/lib/server/rate-limit'

const INVALID_CREDENTIALS = 'Email or password is incorrect'
const MAX_FAILURES = 5
const FAILURE_WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const input = { email: stringField(body, 'email'), password: stringField(body, 'password') }
  const fieldErrors = validateLogin(input)
  if (Object.keys(fieldErrors).length > 0) {
    return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)
  }

  const limitKey = `login:${clientIp(request)}:${normaliseEmail(input.email)}`
  const wait = retryAfter(limitKey, MAX_FAILURES)
  if (wait > 0) {
    const minutes = Math.ceil(wait / 60)
    return NextResponse.json(
      { error: `Too many failed sign-in attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}, or reset your password.` },
      { status: 429, headers: { 'Retry-After': String(wait) } },
    )
  }

  const row = getDb()
    .prepare(`SELECT id, name, email, phone, role, created_at, password_hash FROM users WHERE email = ?`)
    .get(normaliseEmail(input.email))

  const passwordMatches = await verifyPassword(input.password, row ? String(row.password_hash) : await getDummyHash())
  if (!row || !passwordMatches) {
    recordAttempt(limitKey, FAILURE_WINDOW_MS)
    return errorResponse(401, INVALID_CREDENTIALS)
  }
  clearAttempts(limitKey)

  const user = toPublicUser(row)
  createSession(user.id)
  return NextResponse.json({ user })
}
