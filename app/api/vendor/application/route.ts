import { NextResponse } from 'next/server'
import { validateVendorApplication } from '@/lib/vendor-shared'
import { getCurrentUser } from '@/lib/server/auth'
import { errorResponse, readJsonObject, unauthorized, vendorApplicationFromBody } from '@/lib/server/http'
import { submitVendorApplication, VendorError } from '@/lib/server/vendors'

export async function POST(request: Request) {
  const user = getCurrentUser()
  if (!user) return unauthorized()
  if (user.role === 'admin') return errorResponse(403, 'Admin accounts cannot apply as vendors. Use a separate account.')

  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const input = vendorApplicationFromBody(body)
  const fieldErrors = validateVendorApplication(input)
  if (Object.keys(fieldErrors).length > 0) return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)

  try {
    return NextResponse.json({ vendor: submitVendorApplication(user, input, request) }, { status: 201 })
  } catch (err) {
    if (err instanceof VendorError) return errorResponse(err.status, err.message)
    throw err
  }
}
