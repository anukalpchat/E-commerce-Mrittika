// Types and validation shared by the vendor/admin UI and their API routes.
import { INDIAN_STATES } from './orders-shared'
import type { Category } from './products'

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: 'home-living', label: 'Home & Living' },
  { value: 'personal-care', label: 'Personal Care' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'food', label: 'Food' },
]

export const CATEGORY_LABELS: Record<Category, string> = {
  'home-living': 'Home & Living',
  'personal-care': 'Personal Care',
  fashion: 'Fashion',
  food: 'Food',
}

export const GST_RATES = [0, 5, 12, 18, 28]
export const DEFAULT_COMMISSION_RATE = 10

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type ProductStatus = 'pending_review' | 'active' | 'rejected' | 'hidden'

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  pending: 'Under review',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
}

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  pending_review: 'Awaiting review',
  active: 'Live',
  rejected: 'Rejected',
  hidden: 'Hidden by admin',
}

export interface VendorApplicationInput {
  businessName: string
  city: string
  state: string
  gstin: string
  contactPhone: string
  categories: string[]
  description: string
  practices: string
  acceptTerms: boolean
}

export interface Vendor {
  id: number
  userId: number | null
  businessName: string
  city: string
  state: string
  gstin: string | null
  contactEmail: string
  contactPhone: string
  categories: Category[]
  description: string
  practices: string
  status: VendorStatus
  commissionRate: number
  reviewNote: string | null
  createdAt: string
  reviewedAt: string | null
}

export interface ProductInput {
  name: string
  category: string
  price: number
  gstRate: number
  stockCount: number
  shortDescription: string
  description: string
  materials: string[]
  certifications: string[]
  tags: string[]
  imageUrl: string
  plasticAvoidedG: number
  waterSavedL: number
  wasteDivertedG: number
}

export interface VendorProduct extends ProductInput {
  id: number
  slug: string
  status: ProductStatus
  sustainabilityScore: number | null
  reviewNote: string | null
  updatedAt: string
}

// Format: 2-digit state code, 10-character PAN, entity number, 'Z', checksum character.
const GSTIN_PATTERN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

export function validateVendorApplication(input: VendorApplicationInput): Record<string, string> {
  const errors: Record<string, string> = {}
  const name = input.businessName.trim()
  if (name.length < 3 || name.length > 80) errors.businessName = 'Business name must be 3–80 characters'
  if (!input.city.trim()) errors.city = 'City is required'
  if (!INDIAN_STATES.includes(input.state)) errors.state = 'Please select a state'
  if (!GSTIN_PATTERN.test(input.gstin.trim().toUpperCase())) errors.gstin = 'Enter a valid 15-character GSTIN, e.g. 33ABCDE1234F1Z5'
  if (!/^[6-9]\d{9}$/.test(input.contactPhone)) errors.contactPhone = 'Enter a valid 10-digit mobile number'
  const validCategories = input.categories.filter(c => CATEGORY_OPTIONS.some(o => o.value === c))
  if (validCategories.length === 0) errors.categories = 'Choose at least one category'
  if (input.description.trim().length < 30) errors.description = 'Tell us about your business in at least 30 characters'
  if (input.description.length > 1000) errors.description = 'Keep this under 1,000 characters'
  if (input.practices.trim().length < 30) errors.practices = 'Describe your sustainability practices in at least 30 characters'
  if (input.practices.length > 1000) errors.practices = 'Keep this under 1,000 characters'
  if (input.acceptTerms !== true) errors.acceptTerms = 'You must accept the Terms & Conditions to apply'
  return errors
}

function isWholeNumberInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max
}

export function validateProduct(input: ProductInput): Record<string, string> {
  const errors: Record<string, string> = {}
  if (input.name.trim().length < 3 || input.name.length > 100) errors.name = 'Name must be 3–100 characters'
  if (!CATEGORY_OPTIONS.some(o => o.value === input.category)) errors.category = 'Choose a category'
  if (!isWholeNumberInRange(input.price, 1, 500000)) errors.price = 'Enter a whole-rupee price between ₹1 and ₹5,00,000'
  if (!GST_RATES.includes(input.gstRate)) errors.gstRate = `GST rate must be one of ${GST_RATES.join(', ')}%`
  if (!isWholeNumberInRange(input.stockCount, 0, 100000)) errors.stockCount = 'Stock must be a whole number from 0 to 1,00,000'
  if (input.shortDescription.trim().length < 10 || input.shortDescription.length > 160) errors.shortDescription = 'Short description must be 10–160 characters'
  if (input.description.trim().length < 40 || input.description.length > 2000) errors.description = 'Description must be 40–2,000 characters'
  if (input.materials.length === 0) errors.materials = 'List at least one material'
  if (!input.imageUrl.startsWith('/api/uploads/') && !input.imageUrl.startsWith('/products/')) errors.imageUrl = 'Upload a product photo'
  if (!isWholeNumberInRange(input.plasticAvoidedG, 0, 1000000)) errors.plasticAvoidedG = 'Enter grams as a whole number'
  if (!isWholeNumberInRange(input.waterSavedL, 0, 1000000)) errors.waterSavedL = 'Enter litres as a whole number'
  if (!isWholeNumberInRange(input.wasteDivertedG, 0, 1000000)) errors.wasteDivertedG = 'Enter grams as a whole number'
  return errors
}

/** Turns "Organic cotton, Jute" into ['Organic cotton', 'Jute']. */
export function splitList(text: string): string[] {
  return text.split(',').map(s => s.trim()).filter(Boolean).slice(0, 20)
}
