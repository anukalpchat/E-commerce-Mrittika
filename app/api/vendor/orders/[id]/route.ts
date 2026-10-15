import { NextResponse } from 'next/server'
import { errorResponse, forbidden, readJsonObject, stringField } from '@/lib/server/http'
import { OrderError } from '@/lib/server/orders'
import { advanceFulfilment, getApprovedVendor } from '@/lib/server/vendors'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = getApprovedVendor()
  if (!session) return forbidden('Only approved vendors can update fulfilment')

  const body = await readJsonObject(request)
  const status = body ? stringField(body, 'status') : ''
  if (status !== 'shipped' && status !== 'delivered') return errorResponse(400, 'status must be "shipped" or "delivered"')

  try {
    advanceFulfilment(session.vendor, params.id, status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof OrderError) return errorResponse(err.status, err.message)
    throw err
  }
}
