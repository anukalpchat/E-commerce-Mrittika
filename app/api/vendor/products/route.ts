import { NextResponse } from 'next/server'
import { validateProduct } from '@/lib/vendor-shared'
import { createVendorProduct } from '@/lib/server/catalog'
import { errorResponse, forbidden, productInputFromBody, readJsonObject } from '@/lib/server/http'
import { getApprovedVendor } from '@/lib/server/vendors'

export async function POST(request: Request) {
  const session = getApprovedVendor()
  if (!session) return forbidden('Only approved vendors can add products')

  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')
  const input = productInputFromBody(body)
  const fieldErrors = validateProduct(input)
  if (Object.keys(fieldErrors).length > 0) return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)

  return NextResponse.json({ product: createVendorProduct(session.vendor.id, input) }, { status: 201 })
}
