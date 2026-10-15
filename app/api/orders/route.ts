import { NextResponse } from 'next/server'
import { validateAddress } from '@/lib/orders-shared'
import { getAddress, saveAddress } from '@/lib/server/account'
import { getCurrentUser } from '@/lib/server/auth'
import { addressFromBody, errorResponse, readJsonObject, unauthorized } from '@/lib/server/http'
import { CartLine, createOrder, OrderError } from '@/lib/server/orders'

function parseLines(value: unknown): CartLine[] | null {
  if (!Array.isArray(value)) return null
  const lines: CartLine[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') return null
    const { slug, quantity } = entry as Record<string, unknown>
    if (typeof slug !== 'string' || typeof quantity !== 'number') return null
    lines.push({ slug, quantity })
  }
  return lines
}

export async function POST(request: Request) {
  const user = getCurrentUser()
  if (!user) return unauthorized()

  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  if (body.acceptTerms !== true) {
    return errorResponse(400, 'You must accept the Terms & Conditions to place an order', {
      terms: 'You must accept the Terms & Conditions',
    })
  }

  const lines = parseLines(body.items)
  if (!lines) return errorResponse(400, 'items must be a list of { slug, quantity }')

  let address
  if (typeof body.addressId === 'number') {
    address = getAddress(user.id, body.addressId)
    if (!address) return errorResponse(404, 'That saved address no longer exists. Choose another or enter a new one.')
  } else {
    address = addressFromBody(body.address)
    if (!address) return errorResponse(400, 'Provide either addressId or an address object')
    const fieldErrors = validateAddress(address)
    if (Object.keys(fieldErrors).length > 0) return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)
  }

  try {
    const order = createOrder(user.id, lines, address, request)
    // Saving to the address book is a convenience; the order already holds its own copy of the address.
    if (body.saveAddress === true && typeof body.addressId !== 'number') saveAddress(user.id, address)
    return NextResponse.json({ order }, { status: 201 })
  } catch (err) {
    if (err instanceof OrderError) return errorResponse(err.status, err.message)
    throw err
  }
}
