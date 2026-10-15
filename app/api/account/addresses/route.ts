import { NextResponse } from 'next/server'
import { validateAddress } from '@/lib/orders-shared'
import { listAddresses, saveAddress } from '@/lib/server/account'
import { getCurrentUser } from '@/lib/server/auth'
import { addressFromBody, errorResponse, readJsonObject, unauthorized } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = getCurrentUser()
  if (!user) return unauthorized()
  return NextResponse.json({ addresses: listAddresses(user.id) })
}

export async function POST(request: Request) {
  const user = getCurrentUser()
  if (!user) return unauthorized()

  const address = addressFromBody(await readJsonObject(request))
  if (!address) return errorResponse(400, 'Request body must be an address object')
  const fieldErrors = validateAddress(address)
  if (Object.keys(fieldErrors).length > 0) return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)

  const saved = saveAddress(user.id, address)
  if (!saved) return errorResponse(409, 'You can save up to 10 addresses. Delete one to add another.')
  return NextResponse.json({ address: saved }, { status: 201 })
}
