export type SupportTopic = 'general' | 'order' | 'return' | 'vendor' | 'grievance' | 'privacy'
export type TicketStatus = 'open' | 'in_progress' | 'resolved'

export const SUPPORT_TOPICS: { value: SupportTopic; label: string }[] = [
  { value: 'general', label: 'General question' },
  { value: 'order', label: 'Order or delivery' },
  { value: 'return', label: 'Return or refund' },
  { value: 'vendor', label: 'Selling on Mrittika' },
  { value: 'grievance', label: 'Formal grievance / complaint' },
  { value: 'privacy', label: 'My personal data (access, correction, deletion)' },
]

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
}

export const GRIEVANCE_ACK_HOURS = 48
export const GRIEVANCE_RESOLUTION_DAYS = 30

export interface SupportInput {
  name: string
  email: string
  topic: string
  orderId: string
  message: string
}

export function validateSupport(input: SupportInput): Record<string, string> {
  const errors: Record<string, string> = {}
  if (input.name.trim().length < 2 || input.name.length > 80) errors.name = 'Enter your name (2–80 characters)'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.email.length > 254) errors.email = 'Enter a valid email address'
  if (!SUPPORT_TOPICS.some(t => t.value === input.topic)) errors.topic = 'Choose what this is about'
  if (input.orderId && !/^MRT-[23456789A-Z]{8}$/.test(input.orderId.trim().toUpperCase())) {
    errors.orderId = 'Order IDs look like MRT-AB23CD45 — or leave this blank'
  }
  if (input.message.trim().length < 20) errors.message = 'Please describe the issue in at least 20 characters'
  if (input.message.length > 3000) errors.message = 'Keep your message under 3,000 characters'
  return errors
}
