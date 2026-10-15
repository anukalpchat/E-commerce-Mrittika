import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'My Profile' }

export default function ProfilePage() {
  return (
    <PlaceholderPage
      title="My Profile"
      description="Logged-in buyer view — personal details, order history, and the personalised impact dashboard showing cumulative environmental impact."
      sections={[
        { title: 'Account Details', description: 'Name, email, phone, saved addresses. Edit and save controls.' },
        { title: 'Order History', description: 'Past orders with status, date, total, and link to order detail / re-order.' },
        { title: 'Impact Dashboard', description: 'Key differentiator: cumulative plastic saved, carbon offset, purchases made — visualised across order history.' },
        { title: 'Saved Items', description: 'Wishlist of products saved for later.' },
        { title: 'Notifications', description: 'Manage email and platform notification preferences (no pre-ticked boxes).' },
      ]}
    />
  )
}
