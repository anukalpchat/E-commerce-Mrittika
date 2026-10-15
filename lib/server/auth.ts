import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import type { SQLValue } from 'node:sqlite'
import { getDb } from './db'
import type { PublicUser, Role } from '@/lib/auth-types'

export const SESSION_COOKIE = 'mrittika_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000
const KEY_LENGTH = 64

function scryptAsync(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (err, key) => (err ? reject(err) : resolve(key)))
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, KEY_LENGTH)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, keyHex] = stored.split('$')
  if (scheme !== 'scrypt' || !saltHex || !keyHex) {
    throw new Error(`Unrecognised password hash format (scheme "${scheme}"); expected scrypt$salt$key`)
  }
  const expected = Buffer.from(keyHex, 'hex')
  const actual = await scryptAsync(password, Buffer.from(saltHex, 'hex'), expected.length)
  return timingSafeEqual(actual, expected)
}

// Login hashes against this when the email is unknown, so response time does not reveal which emails have accounts.
let dummyHash: Promise<string> | undefined
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword('timing-equaliser-not-a-real-password')
  return dummyHash
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function toPublicUser(row: Record<string, SQLValue>): PublicUser {
  return {
    id: Number(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: row.phone === null ? null : String(row.phone),
    role: row.role as Role,
    createdAt: String(row.created_at),
  }
}

export function createSession(userId: number): void {
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  const db = getDb()
  db.prepare(`DELETE FROM sessions WHERE user_id = ? AND expires_at <= ?`).run(userId, new Date().toISOString())
  db.prepare(`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`).run(
    hashToken(token),
    userId,
    expiresAt.toISOString(),
  )
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  })
}

export function getCurrentUser(): PublicUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null

  const row = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
    )
    .get(hashToken(token))
  if (!row) return null

  if (String(row.expires_at) <= new Date().toISOString()) {
    getDb().prepare(`DELETE FROM sessions WHERE id = ?`).run(hashToken(token))
    return null
  }
  return toPublicUser(row)
}

export function destroySession(): void {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (token) getDb().prepare(`DELETE FROM sessions WHERE id = ?`).run(hashToken(token))
  cookies().delete(SESSION_COOKIE)
}
