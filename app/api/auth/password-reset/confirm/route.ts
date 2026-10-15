import { NextResponse } from 'next/server'
import { validateNewPassword } from '@/lib/auth-validation'
import { errorResponse, readJsonObject, stringField } from '@/lib/server/http'
import { resetPassword } from '@/lib/server/password-reset'

export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const password = stringField(body, 'password')
  const problem = validateNewPassword(password)
  if (problem) return errorResponse(400, problem, { password: problem })

  const result = await resetPassword(stringField(body, 'token'), password)
  if (result === 'invalid') {
    return errorResponse(400, 'This reset link is invalid or has expired. Request a new one.')
  }
  return NextResponse.json({ ok: true })
}
