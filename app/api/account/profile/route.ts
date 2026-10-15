import { NextResponse } from 'next/server'
import { updateProfile } from '@/lib/server/account'
import { getCurrentUser } from '@/lib/server/auth'
import { errorResponse, readJsonObject, stringField, unauthorized } from '@/lib/server/http'

export async function PATCH(request: Request) {
  const user = getCurrentUser()
  if (!user) return unauthorized()

  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const name = stringField(body, 'name').trim()
  const phone = stringField(body, 'phone').trim()
  const fieldErrors: Record<string, string> = {}
  if (name.length < 2 || name.length > 80) fieldErrors.name = 'Name must be 2–80 characters'
  if (phone && !/^[6-9]\d{9}$/.test(phone)) fieldErrors.phone = 'Enter a 10-digit Indian mobile number, or leave it blank'
  if (Object.keys(fieldErrors).length > 0) return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)

  updateProfile(user.id, name, phone || null)
  return NextResponse.json({ user: { ...user, name, phone: phone || null } })
}
