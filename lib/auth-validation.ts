// Shared by the auth forms and the API routes so both enforce identical rules.

export interface RegistrationInput {
  name: string
  email: string
  phone: string
  password: string
  acceptTerms: boolean
}

export interface LoginInput {
  email: string
  password: string
}

export type FieldErrors = Record<string, string>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/
export const PASSWORD_MIN_LENGTH = 8
// Caps scrypt work per request; longer inputs are a cheap way to burn server CPU.
const PASSWORD_MAX_LENGTH = 128

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function validateRegistration(input: RegistrationInput): FieldErrors {
  const errors: FieldErrors = {}
  const name = input.name.trim()
  const email = normaliseEmail(input.email)

  if (name.length < 2) errors.name = 'Enter your full name (at least 2 characters)'
  else if (name.length > 80) errors.name = 'Name must be 80 characters or fewer'

  if (!EMAIL_PATTERN.test(email) || email.length > 254) errors.email = 'Enter a valid email address'

  if (input.phone && !INDIAN_MOBILE_PATTERN.test(input.phone)) {
    errors.phone = 'Enter a 10-digit Indian mobile number, or leave it blank'
  }

  if (input.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  } else if (input.password.length > PASSWORD_MAX_LENGTH) {
    errors.password = `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer`
  } else if (input.password.toLowerCase() === email) {
    errors.password = 'Password must not be the same as your email'
  }

  if (input.acceptTerms !== true) {
    errors.acceptTerms = 'You must confirm you are 18+ and accept the Terms & Conditions to create an account'
  }

  return errors
}

export function validateLogin(input: LoginInput): FieldErrors {
  const errors: FieldErrors = {}
  if (!EMAIL_PATTERN.test(normaliseEmail(input.email))) errors.email = 'Enter a valid email address'
  if (!input.password) errors.password = 'Enter your password'
  else if (input.password.length > PASSWORD_MAX_LENGTH) errors.password = 'Email or password is incorrect'
  return errors
}

/** Only allows same-site relative paths, so `?next=` cannot redirect users to another domain. */
export function safeRedirectPath(next: string | null): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return null
  return next
}
