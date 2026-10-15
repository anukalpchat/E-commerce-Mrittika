import { NextResponse } from 'next/server'
import { normaliseEmail } from '@/lib/auth-validation'
import { errorResponse, readJsonObject, stringField } from '@/lib/server/http'
import { createResetToken } from '@/lib/server/password-reset'
import { clientIp, recordAttempt, retryAfter } from '@/lib/server/rate-limit'

const MAX_REQUESTS = 5
const WINDOW_MS = 15 * 60 * 1000
const GENERIC_MESSAGE = 'If an account exists for that email, a reset link has been sent. It expires in 30 minutes.'

// There is no email service in this project. Outside production — or when explicitly enabled for a demo —
// the link is returned so it can be shown on screen; otherwise it is not delivered anywhere.
const SHOW_LINK = process.env.NODE_ENV !== 'production' || process.env.DEMO_SHOW_RESET_LINKS === 'true'

export async function POST(request: Request) {
  const limitKey = `reset:${clientIp(request)}`
  if (retryAfter(limitKey, MAX_REQUESTS) > 0) {
    return errorResponse(429, 'Too many reset requests from this network. Please wait 15 minutes and try again.')
  }
  recordAttempt(limitKey, WINDOW_MS)

  const body = await readJsonObject(request)
  const email = normaliseEmail(body ? stringField(body, 'email') : '')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse(400, 'Enter a valid email address', { email: 'Enter a valid email address' })
  }

  const token = createResetToken(email)
  if (token && SHOW_LINK) {
    return NextResponse.json({ message: GENERIC_MESSAGE, demoResetLink: `/auth/reset?token=${token}` })
  }
  return NextResponse.json({ message: GENERIC_MESSAGE })
}
