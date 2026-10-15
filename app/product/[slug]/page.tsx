import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { products, getProduct, formatPrice, getBasePrice, getGSTAmount } from '@/lib/products'
import ProductDetailClient from './ProductDetailClient'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct(params.slug)
  if (!product) return { title: 'Product Not Found' }
  return { title: `${product.name} — Mrittika` }
}

export default function ProductDetailPage({ params }: Props) {
  const product = getProduct(params.slug)
  if (!product) notFound()

  const basePrice = getBasePrice(product)
  const gstAmount = getGSTAmount(product)
  const related = products.filter(p => p.category === product.category && p.slug !== product.slug).slice(0, 3)

  return <ProductDetailClient product={product} basePrice={basePrice} gstAmount={gstAmount} related={related} />
}
