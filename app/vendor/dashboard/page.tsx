import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Vendor Dashboard' }

export default function VendorDashboardPage() {
  return (
    <PlaceholderPage
      title="Vendor Dashboard"
      description="Authenticated vendor view — manage listings, track orders, view settlement reports, and monitor sustainability score status."
      sections={[
        { title: 'Overview Stats', description: 'Active listings, pending orders, total revenue (net of commission & TCS), and average sustainability score.' },
        { title: 'My Listings', description: 'Table of all product listings with status (live / under review / suspended), score, and edit/remove actions.' },
        { title: 'Add New Listing', description: 'Link to create a new product listing with sustainability documentation upload.' },
        { title: 'Orders', description: 'Incoming orders with buyer details (delivery address only), status, and fulfilment controls.' },
        { title: 'Settlements', description: 'Payment settlement history — net amount, commission deducted, TCS deducted, payout date.' },
        { title: 'Documents', description: 'Manage uploaded sustainability certifications and MOU copy.' },
      ]}
    />
  )
}
