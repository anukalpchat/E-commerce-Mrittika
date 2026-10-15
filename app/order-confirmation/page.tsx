import { redirect } from 'next/navigation'

// Kept so old links keep working; orders now live at /orders/[id] and are read from the database.
export default function OrderConfirmationRedirect({ searchParams }: { searchParams: { id?: string } }) {
  redirect(searchParams.id ? `/orders/${encodeURIComponent(searchParams.id)}` : '/account?tab=orders')
}
