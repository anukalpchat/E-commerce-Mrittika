import { NextResponse } from 'next/server'
import { normaliseEmail, validateRegistration } from '@/lib/auth-validation'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal'
import { createSession, hashPassword, toPublicUser } from '@/lib/server/auth'
import { recordConsent } from '@/lib/server/consent'
import { getDb, transaction } from '@/lib/server/db'
import { errorResponse, readJsonObject, stringField } from '@/lib/server/http'

export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const input = {
    name: stringField(body, 'name'),
    email: stringField(body, 'email'),
    phone: stringField(body, 'phone').trim(),
    password: stringField(body, 'password'),
    acceptTerms: body.acceptTerms === true,
    acceptPrivacy: body.acceptPrivacy === true,
  }
  const fieldErrors = validateRegistration(input)
  if (Object.keys(fieldErrors).length > 0) {
    return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)
  }

  const email = normaliseEmail(input.email)
  const existing = getDb().prepare(`SELECT id FROM users WHERE email = ?`).get(email)
  if (existing) {
    return errorResponse(409, 'An account with this email already exists', {
      email: 'This email is already registered — sign in instead',
    })
  }

  const passwordHash = await hashPassword(input.password)

  const user = transaction(db => {
    const row = db
      .prepare(
        `INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)
         RETURNING id, name, email, phone, role, created_at`,
      )
      .get(input.name.trim(), email, input.phone || null, passwordHash)
    if (!row) throw new Error(`User insert for ${email} returned no row`)
    const created = toPublicUser(row)
    recordConsent({ userId: created.id, policy: 'terms', policyVersion: TERMS_VERSION, context: 'registration', request }, db)
    recordConsent({ userId: created.id, policy: 'privacy', policyVersion: PRIVACY_VERSION, context: 'registration', request }, db)
    return created
  })

  createSession(user.id)
  return NextResponse.json({ user }, { status: 201 })
}
