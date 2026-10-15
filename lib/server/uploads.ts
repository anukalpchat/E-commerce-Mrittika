import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dataDir } from './db'

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
const NAME_PATTERN = /^[a-f0-9]{32}\.(jpg|png|webp)$/

const CONTENT_TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }

/** Identifies the image type from its first bytes rather than trusting the filename or browser-sent type. */
function detectImageType(bytes: Uint8Array): 'jpg' | 'png' | 'webp' | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg'
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'png'
  const ascii = (from: number, to: number) => String.fromCharCode(...Array.from(bytes.slice(from, to)))
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp'
  return null
}

export class UploadError extends Error {}

export async function saveProductImage(file: File): Promise<string> {
  if (file.size === 0) throw new UploadError('The file is empty')
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError(`Image is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is 2 MB`)
  const bytes = new Uint8Array(await file.arrayBuffer())
  const ext = detectImageType(bytes)
  if (!ext) throw new UploadError('Only JPEG, PNG or WebP images are accepted')

  const name = `${randomBytes(16).toString('hex')}.${ext}`
  await mkdir(dataDir('uploads'), { recursive: true })
  await writeFile(dataDir('uploads', name), bytes)
  return `/api/uploads/${name}`
}

/** Returns null for names that are not ours, so the route can 404 without touching the filesystem. */
export async function readProductImage(name: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (!NAME_PATTERN.test(name)) return null
  try {
    const bytes = await readFile(dataDir('uploads', name))
    return { bytes, contentType: CONTENT_TYPES[name.split('.')[1]] }
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}
