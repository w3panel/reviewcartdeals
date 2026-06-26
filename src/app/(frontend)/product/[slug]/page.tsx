import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProductVariants, getRelatedProducts } from '@/services/products'
import {
  getProductReviews,
  emptyProductReviewStats,
  getProductReviewStatsBatch,
  type ProductReviewStats,
} from '@/services/reviews'
import { getBuildSlugs } from '@/lib/buildSlugs'
import { ChevronRight, ListCollapse, Award } from 'lucide-react'
import { SafeImage } from '@/components/SafeImage'
import { getImageUrl, getProductBrandTitle, getProductMainImage } from '@/lib/utils'
import { getCategoryId, resolveProductCategory } from '@/lib/productCategory'
import type { Category, Product } from '@/payload-types'
import { ProductDetailGrid } from '@/components/ProductDetailGrid'
import { ProductCard, type ProductWithStats } from '@/components/ProductCard'
import { ProductCardGrid } from '@/components/ProductCardGrid'

const ProductReviews = dynamic(
  () => import('@/components/ProductReviews').then((mod) => ({ default: mod.ProductReviews })),
  {
    loading: () => (
      <div className="mt-16 pt-12 border-t border-border text-sm text-muted-foreground">
        Loading reviews...
      </div>
    ),
  },
)

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export const revalidate = 120

export const dynamicParams = true

export async function generateStaticParams() {
  const { productSlugs } = await getBuildSlugs()
  return productSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = (await getProductBySlug(slug)) as Product | null
  if (!product) return {}

  const imageUrl = getImageUrl(getProductMainImage(product), 'card')

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description,
    openGraph: {
      title: product.seo?.title || product.title,
      description: product.seo?.description || product.description,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = (await getProductBySlug(slug)) as Product | null

  if (!product) notFound()

  let category: Category | null = null
  try {
    category = await resolveProductCategory(product.category)
  } catch {
    category = null
  }

  let related: Product[] = []
  try {
    related = (await getRelatedProducts(
      product.id,
      getCategoryId(product.category),
      4,
    )) as Product[]
  } catch {
    related = []
  }

  const [{ reviews, stats }, variants, relatedStats] = await Promise.all([
    getProductReviews(product.id),
    product.enableVariants ? getProductVariants(product.id) : Promise.resolve([]),
    related.length > 0
      ? getProductReviewStatsBatch(related.map((prod) => prod.id))
      : Promise.resolve(new Map<string | number, ProductReviewStats>()),
  ])

  const relatedWithStats: ProductWithStats[] = related.map((prod) => ({
    ...prod,
    stats: relatedStats.get(prod.id) ?? emptyProductReviewStats(),
  }))

  const brandTitle = getProductBrandTitle(product)

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-12">
      <nav className="border-b border-border bg-card py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-muted-foreground overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-primary transition-colors flex-shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          {category ? (
            <>
              <Link
                href={`/category/${category.slug}`}
                className="hover:text-primary transition-colors flex-shrink-0"
              >
                {category.title}
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
            </>
          ) : (
            <>
              <Link href="/search" className="hover:text-primary transition-colors flex-shrink-0">
                Catalog
              </Link>
              <ChevronRight className="h-3 w-3 flex-shrink-0" />
            </>
          )}
          <span className="text-foreground line-clamp-1">{product.title}</span>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
        <ProductDetailGrid
          product={product}
          variants={variants}
          beforeActions={
            <>
              {brandTitle ? (
                <span className="text-xs sm:text-sm font-semibold tracking-widest text-primary uppercase">
                  {brandTitle}
                </span>
              ) : null}
              <h1
                className={`font-serif text-2xl text-white leading-tight sm:text-3xl lg:text-4xl ${brandTitle ? 'mt-2' : ''}`}
              >
                {product.title}
              </h1>

              <div className="my-5 sm:my-6 border-b border-border" />

              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </>
          }
          afterActions={
            <>
              <p className="mt-8 text-xs text-muted-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary flex-shrink-0" />
                Concierge assistance for custom specifications and delivery.
              </p>

              {product.specifications && product.specifications.length > 0 && (
                <div id="specifications" className="mt-8 scroll-mt-24">
                  <h3 className="flex items-center gap-2 text-sm font-semibold tracking-widest text-foreground uppercase mb-4">
                    <ListCollapse className="h-4 w-4 text-primary" />
                    Specifications
                  </h3>
                  <div className="rounded-xl border border-border bg-card overflow-hidden">
                    <table className="w-full text-xs sm:text-sm text-left">
                      <tbody>
                        {product.specifications.map((spec, idx) => (
                          <tr
                            key={spec.id ?? idx}
                            className={idx % 2 === 0 ? 'bg-background' : 'bg-card'}
                          >
                            <td className="px-4 py-3 font-semibold text-muted-foreground w-1/3 border-b border-border uppercase tracking-wider">
                              {spec.key}
                            </td>
                            <td className="px-4 py-3 text-foreground border-b border-border">
                              {spec.value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          }
        />

        <ProductReviews reviews={reviews} stats={stats} />
      </section>

      {relatedWithStats.length > 0 ? (
        <section className="mt-8 border-t border-border bg-card py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="mb-6 font-serif text-xl text-white sm:mb-8 sm:text-2xl">
              Related Products
            </h3>
            <ProductCardGrid>
              {relatedWithStats.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </ProductCardGrid>
          </div>
        </section>
      ) : null}
    </div>
  )
}
