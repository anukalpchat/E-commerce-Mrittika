import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/server/auth'
import { errorResponse, unauthorized } from '@/lib/server/http'
import { cancelOrder, OrderError } from '@/lib/server/orders'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser()
  if (!user) return unauthorized()
  try {
    return NextResponse.json({ order: cancelOrder(user.id, params.id) })
  } catch (err) {
    if (err instanceof OrderError) return errorResponse(err.status, err.message)
    throw err
  }
}
