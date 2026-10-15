import { NextResponse } from 'next/server'
import { validateProduct } from '@/lib/vendor-shared'
import { updateVendorProduct } from '@/lib/server/catalog'
import { errorResponse, forbidden, productInputFromBody, readJsonObject } from '@/lib/server/http'
import { getApprovedVendor } from '@/lib/server/vendors'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = getApprovedVendor()
  if (!session) return forbidden('Only approved vendors can edit products')

  const productId = Number(params.id)
  if (!Number.isInteger(productId)) return errorResponse(400, `Invalid product id "${params.id}"`)

  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')
  const input = productInputFromBody(body)
  const fieldErrors = validateProduct(input)
  if (Object.keys(fieldErrors).length > 0) return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)

  const product = updateVendorProduct(session.vendor.id, productId, input)
  if (!product) return errorResponse(404, 'Product not found in your catalogue')
  return NextResponse.json({ product })
}
