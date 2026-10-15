import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBasePrice, getGSTAmount } from '@/lib/products'
import { getActiveProduct, isVendorVerified, listActiveProducts } from '@/lib/server/catalog'
import ProductDetailClient from './ProductDetailClient'

interface Props { params: { slug: string } }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getActiveProduct(params.slug)
  if (!product) return { title: 'Product Not Found' }
  return { title: `${product.name} — Mrittika` }
}

export default function ProductDetailPage({ params }: Props) {
  const product = getActiveProduct(params.slug)
  if (!product) notFound()

  const basePrice = getBasePrice(product)
  const gstAmount = getGSTAmount(product)
  const related = listActiveProducts().filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 3)

  return (
    <ProductDetailClient
      product={product}
      basePrice={basePrice}
      gstAmount={gstAmount}
      related={related}
      vendorVerified={isVendorVerified(product.vendor)}
    />
  )
}
