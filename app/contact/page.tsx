import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Contact & FAQ' }

export default function ContactPage() {
  return (
    <PlaceholderPage
      title="Contact & FAQ"
      description="Get in touch with the Mrittika team, find answers to common buyer and vendor questions, and access the grievance redressal contact."
      sections={[
        { title: 'Contact Form', description: 'Name, email, subject (Buyer / Vendor / Press / Other), and message. Sends to team inbox.' },
        { title: 'Buyer FAQ', description: 'Common questions: how scoring works, returns, payment safety, impact dashboard.' },
        { title: 'Vendor FAQ', description: 'Common questions: onboarding timeline, what docs are needed, commission structure, GSTIN requirement.' },
        { title: 'Grievance Redressal', description: 'Grievance Officer contact details — links to /terms#grievance for full statutory details.' },
        { title: 'Office Details', description: 'Mumbai, Maharashtra · grievance@mrittika.in · business hours.' },
      ]}
    />
  )
}
