import type { DatabaseSync } from 'node:sqlite'
import { getDb } from './db'
import type { ConsentRecord } from '@/lib/auth-types'

export type ConsentPolicy = 'terms'
export type ConsentContext = 'registration' | 'checkout' | 'vendor-application'

interface ConsentInput {
  userId: number
  policy: ConsentPolicy
  policyVersion: string
  context: ConsentContext
  request: Request
}

/** Pass `db` when recording inside a transaction so the consent commits or rolls back with the action it covers. */
export function recordConsent(input: ConsentInput, db: DatabaseSync = getDb()): void {
  const forwardedFor = input.request.headers.get('x-forwarded-for')
  const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null
  const userAgent = input.request.headers.get('user-agent')

  db.prepare(
    `INSERT INTO consents (user_id, policy, policy_version, context, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(input.userId, input.policy, input.policyVersion, input.context, ipAddress, userAgent)
}

export function listConsentsForUser(userId: number): ConsentRecord[] {
  return getDb()
    .prepare(
      `SELECT id, policy, policy_version, context, accepted_at
       FROM consents WHERE user_id = ? ORDER BY accepted_at DESC, id DESC`,
    )
    .all(userId)
    .map(row => ({
      id: Number(row.id),
      policy: String(row.policy),
      policyVersion: String(row.policy_version),
      context: String(row.context),
      acceptedAt: String(row.accepted_at),
    }))
}
