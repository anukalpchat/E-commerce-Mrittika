import { NextResponse } from 'next/server'
import type { TicketStatus } from '@/lib/support-shared'
import { getAdmin } from '@/lib/server/admin'
import { errorResponse, forbidden, readJsonObject, stringField } from '@/lib/server/http'
import { updateTicket } from '@/lib/server/support'

const STATUSES: TicketStatus[] = ['open', 'in_progress', 'resolved']

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!getAdmin()) return forbidden('Admins only')
  const body = await readJsonObject(request)
  if (!body) return errorResponse(400, 'Request body must be a JSON object')

  const status = stringField(body, 'status') as TicketStatus
  if (!STATUSES.includes(status)) return errorResponse(400, `status must be one of: ${STATUSES.join(', ')}`)
  const note = stringField(body, 'note').slice(0, 2000)
  if (status === 'resolved' && note.trim().length < 5) {
    return errorResponse(400, 'Record how the ticket was resolved (at least 5 characters) before closing it')
  }

  if (!updateTicket(params.id, status, note)) return errorResponse(404, `Ticket ${params.id} not found`)
  return NextResponse.json({ ok: true })
}
