import { NextResponse } from 'next/server'
import { AdminError, getAdmin, ProductAction, reviewProduct } from '@/lib/server/admin'
import { errorResponse, forbidden, readJsonObject, stringField } from '@/lib/server/http'

const ACTIONS: ProductAction[] = ['approve', 'reject', 'hide', 'unhide']

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!getAdmin()) return forbidden('Admins only')

  const productId = Number(params.id)
  const body = await readJsonObject(request)
  if (!Number.isInteger(productId) || !body) return errorResponse(400, 'Expected a product id and a JSON body')

  const action = stringField(body, 'action') as ProductAction
  if (!ACTIONS.includes(action)) return errorResponse(400, `action must be one of: ${ACTIONS.join(', ')}`)

  try {
    reviewProduct(productId, action, typeof body.score === 'number' ? body.score : null, stringField(body, 'note'))
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof AdminError) return errorResponse(err.status, err.message)
    throw err
  }
}
