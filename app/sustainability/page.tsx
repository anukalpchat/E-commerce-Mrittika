import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Sustainability Guide' }

export default function SustainabilityPage() {
  return (
    <PlaceholderPage
      title="Sustainability Guide"
      description="How Mrittika's scoring engine works — methodology, criteria, what vendors must submit, and how buyers can interpret scores."
      sections={[
        { title: 'How Scoring Works', description: 'Step-by-step: vendor submits documentation → Mrittika reviews → score assigned → displayed on listing.' },
        { title: 'Scoring Criteria', description: 'Breakdown of criteria — materials sourcing, manufacturing process, packaging, certifications, carbon footprint.' },
        { title: 'Certification Types', description: 'Which certifications are accepted (organic, fair-trade, BIS, FSSAI, etc.) and how they map to score components.' },
        { title: 'Score Interpretation', description: 'What each score range means for buyers — and why scores are indicative, not third-party certifications.' },
        { title: 'For Vendors', description: 'How to prepare documentation, common rejection reasons, and the appeals process.' },
      ]}
    />
  )
}
