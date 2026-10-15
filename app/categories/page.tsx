import type { Metadata } from 'next'
import { listActiveProducts } from '@/lib/server/catalog'
import CategoriesClient from './CategoriesClient'

export const metadata: Metadata = { title: 'Shop' }
export const dynamic = 'force-dynamic'

export default function CategoriesPage() {
  return <CategoriesClient products={listActiveProducts()} />
}
