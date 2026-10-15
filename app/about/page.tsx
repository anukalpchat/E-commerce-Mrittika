import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'About Us' }

export default function AboutPage() {
  return (
    <PlaceholderPage
      title="About Us"
      description="Mrittika's mission, origin story, team, and values — why verified sustainability matters and what makes this marketplace different."
      sections={[
        { title: 'Mission Statement', description: 'Why Mrittika exists — the problem with unverified sustainability claims and what a verified marketplace changes.' },
        { title: 'Our Story', description: 'Origin, founding team, and what gap in the Indian sustainable goods market Mrittika addresses.' },
        { title: 'How We\'re Different', description: 'Structured scoring engine + personal impact dashboard — neither competitor does both well.' },
        { title: 'Team', description: 'Team member cards with role and brief bio.' },
        { title: 'Values', description: 'Transparency, verification, fair vendor partnerships, no greenwashing.' },
      ]}
    />
  )
}
