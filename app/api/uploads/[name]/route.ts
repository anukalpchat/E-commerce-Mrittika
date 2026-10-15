import { readProductImage } from '@/lib/server/uploads'

export async function GET(_request: Request, { params }: { params: { name: string } }) {
  const image = await readProductImage(params.name)
  if (!image) return new Response('Image not found', { status: 404 })
  return new Response(new Uint8Array(image.bytes), {
    headers: {
      'Content-Type': image.contentType,
      // Names are random and never reused, so the file at a URL never changes.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
