import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Vendor Registration' }

export default function VendorRegisterPage() {
  return (
    <PlaceholderPage
      title="Vendor Registration"
      description="Onboarding application for sustainable sellers — business details, product categories, sustainability documentation, and mandatory GSTIN verification."
      sections={[
        { title: 'Business Details', description: 'Business name, type, registered address, contact person.' },
        { title: 'Product Categories', description: 'Select categories to list under (Home & Living, Personal Care, Fashion, Food).' },
        { title: 'Sustainability Documentation', description: 'Upload certifications, material sourcing statements, or equivalent evidence for scoring.' },
        { title: 'GSTIN & Tax Details', description: 'Mandatory GSTIN entry and verification — required for TCS reconciliation under Section 52 CGST Act.' },
        { title: 'MOU Acceptance', description: 'Vendor MOU presented for review and mandatory acceptance (separate click-wrap from buyer T&C).' },
        { title: 'Submit Application', description: 'Enters review queue — Mrittika team evaluates docs and approves or requests clarification.' },
      ]}
    />
  )
}
