import { NextResponse } from 'next/server'
import { getActiveProduct } from '@/lib/server/catalog'
import { addToWishlist, listWishlist, removeFromWishlist } from '@/lib/server/account'
import { getCurrentUser } from '@/lib/server/auth'
import { errorResponse, readJsonObject, stringField, unauthorized } from '@/lib/server/http'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = getCurrentUser()
  if (!user) return unauthorized()
  return NextResponse.json({ slugs: listWishlist(user.id).map(p => p.slug) })
}

async function readSlug(request: Request): Promise<string | null> {
  const body = await readJsonObject(request)
  const slug = body ? stringField(body, 'slug') : ''
  return getActiveProduct(slug) ? slug : null
}

export async function POST(request: Request) {
  const user = getCurrentUser()
  if (!user) return unauthorized()
  const slug = await readSlug(request)
  if (!slug) return errorResponse(400, 'Unknown product slug')
  addToWishlist(user.id, slug)
  return NextResponse.json({ ok: true }, { status: 201 })
}

export async function DELETE(request: Request) {
  const user = getCurrentUser()
  if (!user) return unauthorized()
  const slug = await readSlug(request)
  if (!slug) return errorResponse(400, 'Unknown product slug')
  removeFromWishlist(user.id, slug)
  return NextResponse.json({ ok: true })
}
