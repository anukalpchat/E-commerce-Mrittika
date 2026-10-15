export type Role = 'buyer' | 'vendor' | 'admin'

export interface PublicUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: Role
  createdAt: string
}

export interface ConsentRecord {
  id: number
  policy: string
  policyVersion: string
  context: string
  acceptedAt: string
}

export interface ApiError {
  error: string
  fieldErrors?: Record<string, string>
}
