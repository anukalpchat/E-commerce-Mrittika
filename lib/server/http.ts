import { NextResponse } from 'next/server'
import type { ApiError } from '@/lib/auth-types'
import type { AddressInput } from '@/lib/orders-shared'
import type { ProductInput, VendorApplicationInput } from '@/lib/vendor-shared'

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

export function addressFromBody(value: unknown): AddressInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const v = value as Record<string, unknown>
  return {
    name: stringField(v, 'name'),
    phone: stringField(v, 'phone').trim(),
    line1: stringField(v, 'line1'),
    line2: stringField(v, 'line2'),
    city: stringField(v, 'city'),
    state: stringField(v, 'state'),
    pincode: stringField(v, 'pincode').trim(),
  }
}

export function unauthorized(): NextResponse<ApiError> {
  return errorResponse(401, 'Please sign in to continue')
}

function numberField(body: Record<string, unknown>, key: string): number {
  const value = body[key]
  return typeof value === 'number' ? value : Number.NaN
}

function listField(body: Record<string, unknown>, key: string): string[] {
  const value = body[key]
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string').map(v => v.trim()).filter(Boolean).slice(0, 20) : []
}

export function productInputFromBody(body: Record<string, unknown>): ProductInput {
  return {
    name: stringField(body, 'name'),
    category: stringField(body, 'category'),
    price: numberField(body, 'price'),
    gstRate: numberField(body, 'gstRate'),
    stockCount: numberField(body, 'stockCount'),
    shortDescription: stringField(body, 'shortDescription'),
    description: stringField(body, 'description'),
    materials: listField(body, 'materials'),
    certifications: listField(body, 'certifications'),
    tags: listField(body, 'tags'),
    imageUrl: stringField(body, 'imageUrl'),
    plasticAvoidedG: numberField(body, 'plasticAvoidedG'),
    waterSavedL: numberField(body, 'waterSavedL'),
    wasteDivertedG: numberField(body, 'wasteDivertedG'),
  }
}

export function vendorApplicationFromBody(body: Record<string, unknown>): VendorApplicationInput {
  return {
    businessName: stringField(body, 'businessName'),
    city: stringField(body, 'city'),
    state: stringField(body, 'state'),
    gstin: stringField(body, 'gstin'),
    contactPhone: stringField(body, 'contactPhone').trim(),
    categories: listField(body, 'categories'),
    description: stringField(body, 'description'),
    practices: stringField(body, 'practices'),
    acceptTerms: body.acceptTerms === true,
  }
}

export function forbidden(message: string): NextResponse<ApiError> {
  return errorResponse(403, message)
}
