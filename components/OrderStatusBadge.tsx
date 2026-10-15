import { OrderStatus, STATUS_LABELS } from '@/lib/orders-shared'

const STYLES: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-50 text-amber-900 border-amber-300',
  paid: 'bg-canopy/10 text-canopy border-canopy/40',
  shipped: 'bg-canopy/10 text-canopy border-canopy/40',
  delivered: 'bg-canopy text-vellum border-canopy',
  payment_failed: 'bg-sienna/10 text-sienna border-sienna/40',
  cancelled: 'bg-sand/40 text-mist border-sand',
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block text-xs font-sans uppercase tracking-widest px-2.5 py-1 rounded-sm border ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}
