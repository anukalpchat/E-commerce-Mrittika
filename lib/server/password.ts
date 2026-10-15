import { randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64

function scryptAsync(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, (err, key) => (err ? reject(err) : resolve(key)))
  })
}

function encode(salt: Buffer, key: Buffer): string {
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  return encode(salt, await scryptAsync(password, salt, KEY_LENGTH))
}

/** Synchronous variant for seeding demo accounts during database setup. */
export function hashPasswordSync(password: string): string {
  const salt = randomBytes(16)
  return encode(salt, scryptSync(password, salt, KEY_LENGTH))
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
