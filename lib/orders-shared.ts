// Types and rules shared by the checkout/account UI and the order API, so both agree on totals and validation.

export type OrderStatus = 'pending_payment' | 'paid' | 'payment_failed' | 'cancelled' | 'shipped' | 'delivered'
export type PaymentOutcome = 'success' | 'failed' | 'cancelled'

export const FREE_SHIPPING_ABOVE = 999
const FLAT_SHIPPING = 89

export function shippingFor(subtotal: number): number {
  return subtotal > FREE_SHIPPING_ABOVE ? 0 : FLAT_SHIPPING
}

/** Splits a GST-inclusive amount into its taxable value and tax, rounded to whole rupees like the catalogue. */
export function splitGst(inclusiveAmount: number, gstRate: number): { taxable: number; gst: number } {
  const taxable = Math.round(inclusiveAmount / (1 + gstRate / 100))
  return { taxable, gst: inclusiveAmount - taxable }
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid — preparing',
  payment_failed: 'Payment failed',
  cancelled: 'Cancelled',
  shipped: 'Shipped',
  delivered: 'Delivered',
}

/** Statuses where the customer has actually paid, so the order counts toward their impact. */
export const PAID_STATUSES: OrderStatus[] = ['paid', 'shipped', 'delivered']

export interface AddressInput {
  name: string
  phone: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
}

export interface SavedAddress extends AddressInput {
  id: number
}

export interface OrderItem {
  productSlug: string
  productName: string
  vendor: string
  vendorLocation: string
  countryOfOrigin: string
  category: string
  unitPrice: number
  gstRate: number
  quantity: number
}

export interface OrderEvent {
  status: string
  note: string
  createdAt: string
}

export interface OrderSummary {
  id: string
  status: OrderStatus
  total: number
  itemCount: number
  createdAt: string
}

export interface OrderDetail extends OrderSummary {
  subtotal: number
  shipping: number
  paymentMethod: string | null
  paidAt: string | null
  shippingAddress: AddressInput
  items: OrderItem[]
  events: OrderEvent[]
}

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

export function validateAddress(address: AddressInput): Record<string, string> {
  const errors: Record<string, string> = {}
  if (!address.name.trim()) errors.name = 'Full name is required'
  else if (address.name.trim().length > 80) errors.name = 'Name must be 80 characters or fewer'
  if (!/^[6-9]\d{9}$/.test(address.phone)) errors.phone = 'Enter a valid 10-digit mobile number'
  if (!address.line1.trim()) errors.line1 = 'Address line 1 is required'
  else if (address.line1.length > 120) errors.line1 = 'Keep address line 1 under 120 characters'
  if (address.line2.length > 120) errors.line2 = 'Keep address line 2 under 120 characters'
  if (!address.city.trim()) errors.city = 'City is required'
  if (!INDIAN_STATES.includes(address.state)) errors.state = 'Please select a state'
  if (!/^[1-9]\d{5}$/.test(address.pincode)) errors.pincode = 'Enter a valid 6-digit pincode'
  return errors
}

export const MAX_QUANTITY_PER_ITEM = 10
