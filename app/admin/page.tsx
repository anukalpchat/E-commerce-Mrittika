import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Admin Panel' }

export default function AdminPage() {
  return (
    <PlaceholderPage
      title="Admin Panel"
      description="Internal Mrittika team view — vendor approvals, listing moderation, sustainability score management, platform analytics, and grievance queue."
      sections={[
        { title: 'Vendor Applications', description: 'Review queue for new vendor applications — approve, request more docs, or reject with reason.' },
        { title: 'Listing Moderation', description: 'Flagged listings for review — sustainability claim disputes, prohibited items, inaccurate descriptions.' },
        { title: 'Scoring Engine', description: 'Review and update sustainability scoring criteria and weights. Audit log of score changes.' },
        { title: 'Platform Analytics', description: 'GMV, active users, vendor count, top categories, and platform-wide impact metrics.' },
        { title: 'Grievance Queue', description: 'Open complaints assigned to Grievance Officer — status, response, and resolution tracking (48hr / 30-day SLA).' },
        { title: 'User Management', description: 'Search, view, suspend, or delete user/vendor accounts. Manage roles and permissions.' },
      ]}
    />
  )
}
