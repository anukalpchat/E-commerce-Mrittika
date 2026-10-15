import { NextResponse } from 'next/server'
import { deleteAddress } from '@/lib/server/account'
import { getCurrentUser } from '@/lib/server/auth'
import { errorResponse, unauthorized } from '@/lib/server/http'

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser()
  if (!user) return unauthorized()

  const addressId = Number(params.id)
  if (!Number.isInteger(addressId)) return errorResponse(400, `Invalid address id "${params.id}"`)
  if (!deleteAddress(user.id, addressId)) return errorResponse(404, 'Address not found on your account')
  return NextResponse.json({ ok: true })
}
