import { NextResponse } from 'next/server'
import { AdminError, getAdmin, reviewVendor, VendorAction } from '@/lib/server/admin'
import { errorResponse, forbidden, readJsonObject, stringField } from '@/lib/server/http'

const ACTIONS: VendorAction[] = ['approve', 'reject', 'suspend', 'reinstate']

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!getAdmin()) return forbidden('Admins only')

  const vendorId = Number(params.id)
  const body = await readJsonObject(request)
  if (!Number.isInteger(vendorId) || !body) return errorResponse(400, 'Expected a vendor id and a JSON body')

  const action = stringField(body, 'action') as VendorAction
  if (!ACTIONS.includes(action)) return errorResponse(400, `action must be one of: ${ACTIONS.join(', ')}`)
  const rate = body.commissionRate
  if (rate !== undefined && (typeof rate !== 'number' || rate < 0 || rate > 50)) {
    return errorResponse(400, 'commissionRate must be a number from 0 to 50')
  }

  try {
    reviewVendor(vendorId, action, stringField(body, 'note'), typeof rate === 'number' ? rate : null)
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AdminError) return errorResponse(err.status, err.message)
    throw err
  }
}
