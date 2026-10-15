import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Journal' }

export default function JournalPage() {
  return (
    <PlaceholderPage
      title="Journal"
      description="Editorial content — vendor stories, sustainability deep-dives, how-to guides on conscious consumption, and platform updates."
      sections={[
        { title: 'Featured Article', description: 'Hero editorial piece — full-width image, title, excerpt, and read-more link.' },
        { title: 'Article Grid', description: 'Card grid of all published articles with category tag, date, and reading time.' },
        { title: 'Categories', description: 'Filter by: Vendor Stories · Sustainability Deep Dives · How-To Guides · Platform News.' },
        { title: 'Article Detail', description: 'Individual article page with full text, author, related products, and share controls.' },
      ]}
    />
  )
}
