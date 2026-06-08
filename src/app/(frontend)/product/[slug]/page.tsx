import React from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/services/products'
import { getProductReviews } from '@/services/reviews'
import { getBuildSlugs } from '@/lib/buildSlugs'
import { MessageCircle, ChevronRight, ListCollapse, Award, BadgeCheck } from 'lucide-react'
import { getImageUrl, getProductMainImage, buildProductGalleryImages } from '@/lib/utils'
import { getCategoryId, resolveProductCategory } from '@/lib/productCategory'
import type { Product, Brand } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'
import { ProductGallery } from '@/components/ProductGallery'

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

export const revalidate = 60

export async function generateStaticParams() {
  const { productSlugs } = await getBuildSlugs()
  return productSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const product = (await getProductBySlug(slug)) as Product | null
  if (!product) return {}

  return {
    title: `${product.seo?.title || product.title} | ReviewCartDeals`,
    description: product.seo?.description || product.description,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = (await getProductBySlug(slug)) as Product | null

  if (!product) notFound()

  const [category, relatedProducts, { reviews, stats }] = await Promise.all([
    resolveProductCategory(product.category),
    getRelatedProducts(product.id, getCategoryId(product.category), 4),
    getProductReviews(product.id),
  ])
  const related = relatedProducts as Product[]
  const galleryImages = buildProductGalleryImages(product)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewcartdeals.com'
  const productUrl = `${siteUrl}/product/${product.slug}`
  const whatsappMessage = `Hello,\n\nI am interested in this product:\n\nProduct Name: ${product.title}\nProduct URL: ${productUrl}\n\nPlease share more details.`
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  const brandTitle =
    typeof product.brand === 'object' && product.brand !== null
      ? (product.brand as Brand).title
      : String(product.brand)

  return (
    <div className="w-full min-h-screen bg-background text-foreground pb-28 md:pb-12">
      <nav className="border-b border-border bg-card py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-muted-foreground overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-primary transition-colors flex-shrink-0">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link
            href={`/category/${category.slug}`}
            className="hover:text-primary transition-colors flex-shrink-0"
          >
            {category.title}
          </Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-foreground line-clamp-1">{product.title}</span>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:gap-12 md:grid-cols-2">
          <ProductGallery images={galleryImages} title={product.title} />

          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold tracking-widest text-primary uppercase">
              {brandTitle}
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {product.title}
            </h1>

            <div className="my-5 sm:my-6 border-b border-border" />

            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>

            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 sm:gap-3 rounded-xl bg-whatsapp px-6 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="h-5 w-5" />
                Enquire via WhatsApp
              </a>
              <AddToCartButton product={product} />
            </div>

            <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary flex-shrink-0" />
              Concierge assistance for custom specifications and delivery.
            </p>

            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-8">
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
          </div>
        </div>

        <ProductReviews reviews={reviews} stats={stats} />
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-card py-10 sm:py-14 mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-lg sm:text-xl font-semibold tracking-widest text-foreground uppercase mb-6 sm:mb-8">
              Related Products
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {related.map((prod) => (
                <div
                  key={prod.id}
                  className="flex flex-col p-3 sm:p-5 border border-border rounded-2xl bg-background hover:border-primary transition-colors group"
                >
                  <Link href={`/product/${prod.slug}`} className="flex flex-col flex-grow gap-3">
                    <div className="relative aspect-square bg-card rounded-xl overflow-hidden">
                      <Image
                        src={getImageUrl(getProductMainImage(prod))}
                        alt={prod.title}
                        fill
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider">
                        {typeof prod.brand === 'object' && prod.brand !== null
                          ? (prod.brand as Brand).title
                          : String(prod.brand)}
                        {typeof prod.brand === 'object' &&
                          prod.brand !== null &&
                          (prod.brand as Brand).verified && <BadgeCheck className="w-3.5 h-3.5" />}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight mt-1 line-clamp-2">
                        {prod.title}
                      </h3>
                    </div>
                  </Link>
                  <div className="mt-3">
                    <AddToCartButton product={prod} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed bottom-16 left-0 right-0 z-40 md:hidden border-t border-border bg-background/95 backdrop-blur px-4 py-3 pb-safe">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-card border border-border">
              <Image
                src={getImageUrl(getProductMainImage(product))}
                alt={product.title}
                width={44}
                height={44}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-primary uppercase truncate">{brandTitle}</p>
              <p className="text-xs font-medium text-foreground truncate">{product.title}</p>
            </div>
          </div>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg bg-whatsapp px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white flex-shrink-0"
          >
            <MessageCircle className="h-4 w-4" />
            Enquire
          </a>
        </div>
      </div>
    </div>
  )
}
