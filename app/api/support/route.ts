import { NextResponse } from 'next/server'
import { validateSupport } from '@/lib/support-shared'
import { getCurrentUser } from '@/lib/server/auth'
import { errorResponse, readJsonObject, stringField } from '@/lib/server/http'
import { createTicket } from '@/lib/server/support'

export async function POST(request: Request) {
  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  // Honeypot: the "website" field is hidden from people, so only bots fill it. Answer as if it worked
  // so they do not learn to skip it, but store nothing.
  if (stringField(body, 'website')) return NextResponse.json({ ticket: { id: 'SUP-RECEIVED' } }, { status: 201 })

  const input = {
    name: stringField(body, 'name'),
    email: stringField(body, 'email'),
    topic: stringField(body, 'topic'),
    orderId: stringField(body, 'orderId'),
    message: stringField(body, 'message'),
  }
  const fieldErrors = validateSupport(input)
  if (Object.keys(fieldErrors).length > 0) return errorResponse(400, 'Please fix the highlighted fields', fieldErrors)

  const ticket = createTicket(input, getCurrentUser()?.id ?? null)
  return NextResponse.json({ ticket: { id: ticket.id, acknowledgeBy: ticket.acknowledgeBy } }, { status: 201 })
}
