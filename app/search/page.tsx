import type { Metadata } from 'next'
import PlaceholderPage from '@/components/PlaceholderPage'

export const metadata: Metadata = { title: 'Search Results' }

export default function SearchPage() {
  return (
    <PlaceholderPage
      title="Search Results"
      description="Full-text search across products and vendors, with the 'Shop by Impact' filter set as a primary differentiator — filter by sustainability score range, certification type, and impact category."
      sections={[
        { title: 'Search Bar', description: 'Query input with autocomplete suggestions and recent searches.' },
        { title: 'Shop by Impact Filters', description: 'Score range slider · certification type · impact category (plastic-free, carbon-neutral, fair-trade, organic) — Mrittika differentiator.' },
        { title: 'Standard Filters', description: 'Category · price range · vendor location · in-stock only.' },
        { title: 'Results Grid', description: 'Product cards with score badge, name, vendor, price. Sort: relevance / score (high–low) / price.' },
        { title: 'Empty State', description: 'Clear message when no results — suggests related categories or broader search terms.' },
      ]}
    />
  )
}
