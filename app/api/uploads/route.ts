import { NextResponse } from 'next/server'
import { errorResponse, forbidden } from '@/lib/server/http'
import { saveProductImage, UploadError } from '@/lib/server/uploads'
import { getApprovedVendor } from '@/lib/server/vendors'

export async function POST(request: Request) {
  if (!getApprovedVendor()) return forbidden('Only approved vendors can upload product photos')

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return errorResponse(400, 'Send the photo as multipart/form-data in a field named "image"')
  }
  const file = form.get('image')
  if (!(file instanceof File)) return errorResponse(400, 'Attach a photo in the "image" field')

  try {
    return NextResponse.json({ url: await saveProductImage(file) }, { status: 201 })
  } catch (err) {
    if (err instanceof UploadError) return errorResponse(400, err.message)
    throw err
  }
}
