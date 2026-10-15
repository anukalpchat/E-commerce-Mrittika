import { createHash, randomBytes } from 'node:crypto'
import { getDb, transaction } from './db'
import { hashPassword } from './password'

const RESET_TTL_MS = 30 * 60 * 1000

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/** Creates a single-use reset token for the account, or returns null if no account has this email. */
export function createResetToken(email: string): string | null {
  const user = getDb().prepare(`SELECT id FROM users WHERE email = ?`).get(email)
  if (!user) return null
  const token = randomBytes(32).toString('base64url')
  transaction(db => {
    // Only the newest link works, so an older link found in someone's history is useless.
    db.prepare(`DELETE FROM password_resets WHERE user_id = ?`).run(Number(user.id))
    db.prepare(`INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)`).run(
      hashToken(token), Number(user.id), new Date(Date.now() + RESET_TTL_MS).toISOString(),
    )
  })
  return token
}

export type ResetResult = 'ok' | 'invalid'

/** Sets the new password and signs the account out everywhere, so a stolen session cannot outlive the reset. */
export async function resetPassword(token: string, newPassword: string): Promise<ResetResult> {
  const row = getDb()
    .prepare(`SELECT user_id, expires_at FROM password_resets WHERE token_hash = ?`)
    .get(hashToken(token))
  if (!row || String(row.expires_at) <= new Date().toISOString()) return 'invalid'

  const passwordHash = await hashPassword(newPassword)
  const userId = Number(row.user_id)
  transaction(db => {
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(passwordHash, userId)
    db.prepare(`DELETE FROM password_resets WHERE user_id = ?`).run(userId)
    db.prepare(`DELETE FROM sessions WHERE user_id = ?`).run(userId)
  })
  return 'ok'
}
