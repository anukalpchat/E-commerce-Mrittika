import { NextResponse } from 'next/server'
import type { ApiError } from '@/lib/auth-types'

export function errorResponse(status: number, error: string, fieldErrors?: Record<string, string>): NextResponse<ApiError> {
  return NextResponse.json(fieldErrors ? { error, fieldErrors } : { error }, { status })
}

/** Returns null when the body is missing or not a JSON object, so routes can answer 400 instead of crashing. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export function stringField(body: Record<string, unknown>, key: string): string {
  const value = body[key]
  return typeof value === 'string' ? value : ''
}
