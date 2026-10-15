import { NextResponse } from 'next/server'
import type { PaymentOutcome } from '@/lib/orders-shared'
import { getCurrentUser } from '@/lib/server/auth'
import { errorResponse, readJsonObject, stringField, unauthorized } from '@/lib/server/http'
import { OrderError, recordPaymentOutcome } from '@/lib/server/orders'

const OUTCOMES: PaymentOutcome[] = ['success', 'failed', 'cancelled']

// SIMULATED PAYMENT ENDPOINT — records whatever outcome the mock modal reports. See recordPaymentOutcome.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = getCurrentUser()
  if (!user) return unauthorized()

  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const outcome = stringField(body, 'outcome') as PaymentOutcome
  if (!OUTCOMES.includes(outcome)) return errorResponse(400, `outcome must be one of: ${OUTCOMES.join(', ')}`)
  const method = stringField(body, 'method').slice(0, 80) || 'Unspecified method'

  try {
    const order = recordPaymentOutcome(user.id, params.id, outcome, method)
    return NextResponse.json({ order })
  } catch (err) {
    if (err instanceof OrderError) return errorResponse(err.status, err.message)
    throw err
  }
}
