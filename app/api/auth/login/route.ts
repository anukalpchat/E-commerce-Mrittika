import { NextResponse } from 'next/server'
import { normaliseEmail, validateLogin } from '@/lib/auth-validation'
import { createSession, getDummyHash, toPublicUser, verifyPassword } from '@/lib/server/auth'
import { getDb } from '@/lib/server/db'
import { errorResponse, readJsonObject, stringField } from '@/lib/server/http'

const INVALID_CREDENTIALS = 'Email or password is incorrect'

export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const input = { email: stringField(body, 'email'), password: stringField(body, 'password') }
  const fieldErrors = validateLogin(input)
  if (Object.keys(fieldErrors).length > 0) {
    return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)
  }

  const row = getDb()
    .prepare(`SELECT id, name, email, phone, role, created_at, password_hash FROM users WHERE email = ?`)
    .get(normaliseEmail(input.email))

  const passwordMatches = await verifyPassword(input.password, row ? String(row.password_hash) : await getDummyHash())
  if (!row || !passwordMatches) return errorResponse(401, INVALID_CREDENTIALS)

  const user = toPublicUser(row)
  createSession(user.id)
  return NextResponse.json({ user })
}
