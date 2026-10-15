import { randomBytes } from 'node:crypto'
import { getDb } from './db'
import { GRIEVANCE_ACK_HOURS, GRIEVANCE_RESOLUTION_DAYS, SupportInput, SupportTopic, TicketStatus } from '@/lib/support-shared'

export interface SupportTicket {
  id: string
  userId: number | null
  name: string
  email: string
  topic: SupportTopic
  orderId: string | null
  message: string
  status: TicketStatus
  adminNote: string | null
  createdAt: string
  updatedAt: string
  /** Deadlines from the E-Commerce Rules; shown to admins so overdue grievances stand out. */
  acknowledgeBy: string
  resolveBy: string
}

function newTicketId(): string {
  const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  return 'SUP-' + Array.from(randomBytes(6), b => alphabet[b % alphabet.length]).join('')
}

function addHours(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 3600 * 1000).toISOString()
}

function toTicket(r: Record<string, unknown>): SupportTicket {
  const createdAt = String(r.created_at)
  return {
    id: String(r.id),
    userId: r.user_id === null ? null : Number(r.user_id),
    name: String(r.name),
    email: String(r.email),
    topic: r.topic as SupportTopic,
    orderId: r.order_id === null ? null : String(r.order_id),
    message: String(r.message),
    status: r.status as TicketStatus,
    adminNote: r.admin_note === null ? null : String(r.admin_note),
    createdAt,
    updatedAt: String(r.updated_at),
    acknowledgeBy: addHours(createdAt, GRIEVANCE_ACK_HOURS),
    resolveBy: addHours(createdAt, GRIEVANCE_RESOLUTION_DAYS * 24),
  }
}

export function createTicket(input: SupportInput, userId: number | null): SupportTicket {
  const row = getDb()
    .prepare(
      `INSERT INTO support_tickets (id, user_id, name, email, topic, order_id, message)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *`,
    )
    .get(
      newTicketId(), userId, input.name.trim(), input.email.trim().toLowerCase(), input.topic,
      input.orderId.trim().toUpperCase() || null, input.message.trim(),
    )
  if (!row) throw new Error(`Support ticket insert for ${input.email} returned no row`)
  return toTicket(row)
}

export function listTickets(): SupportTicket[] {
  return getDb()
    .prepare(
      `SELECT * FROM support_tickets
       ORDER BY CASE status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
                CASE topic WHEN 'grievance' THEN 0 ELSE 1 END, created_at`,
    )
    .all()
    .map(toTicket)
}

export function listTicketsForUser(userId: number): SupportTicket[] {
  return getDb().prepare(`SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC`).all(userId).map(toTicket)
}

/** Returns false when the ticket does not exist. */
export function updateTicket(id: string, status: TicketStatus, adminNote: string): boolean {
  const result = getDb()
    .prepare(
      `UPDATE support_tickets SET status = ?, admin_note = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?`,
    )
    .run(status, adminNote.trim() || null, id)
  return Number(result.changes) > 0
}

export function countOpenTickets(): number {
  return Number(getDb().prepare(`SELECT COUNT(*) AS n FROM support_tickets WHERE status != 'resolved'`).get()?.n ?? 0)
}
