import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductBySlug, getRelatedProducts } from '@/services/products'
import { getProductReviews } from '@/services/reviews'
import { getBuildSlugs } from '@/lib/buildSlugs'
// ProductGallery removed, using direct image
import { MessageCircle, ChevronRight, ListCollapse, Award, BadgeCheck } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category, Brand, Media } from '@/payload-types'
import { ProductReviews } from '@/components/ProductReviews'
import { AddToCartButton } from '@/components/AddToCartButton'

interface ProductPageProps {
  params: Promise<{
    slug: string
  }>
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
    description: product.seo?.description || product.shortDescription,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = (await getProductBySlug(slug)) as Product | null

  if (!product) {
    notFound()
  }

  const category = product.category as Category
  const relatedProducts = (await getRelatedProducts(product.id, category.id, 4)) as Product[]

  const { reviews, stats } = await getProductReviews(product.id)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewcartdeals.com'
  const productUrl = `${siteUrl}/product/${product.slug}`
  
  // Format WhatsApp message
  const whatsappMessage = `Hello,

I am interested in this product:

Product Name: ${product.title}
Product URL: ${productUrl}

Please share more details.`

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="w-full min-h-screen bg-luxury-black text-gray-200 pb-24 sm:pb-12">
      {/* Breadcrumbs */}
      <nav className="border-b border-luxury-gray/40 bg-luxury-dark/40 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-gray-500">
          <Link href="/" className="hover:text-luxury-gold transition-colors">
            HOME
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/category/${category.slug}`} className="hover:text-luxury-gold transition-colors">
            {category.title}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-300 font-medium line-clamp-1">{product.title}</span>
        </div>
      </nav>

      {/* Main product contents */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Left Column: Gallery */}
          <div>
            <Image src={getImageUrl(product.image)} alt={product.title} width={500} height={500} className="object-contain" />
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-serif text-sm font-semibold tracking-widest text-luxury-gold uppercase">
                  {typeof product.brand === 'object' && product.brand !== null ? (product.brand as Brand).title : String(product.brand)}
                </span>
                <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide uppercase">
                  {product.title}
                </h1>
              </div>
            </div>
            
            {/* Divider */}
            <div className="my-6 border-b border-luxury-gray/40" />

            {/* Short Description */}
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {product.shortDescription}
            </p>

            {/* WhatsApp CTA */}
            <div className="mt-8">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded bg-luxury-gold px-8 py-4 text-xs font-bold uppercase tracking-widest text-luxury-black hover:bg-luxury-gold-hover transition-all duration-300 shadow-[0_0_20px_rgba(197,168,128,0.15)] hover:shadow-[0_0_25px_rgba(197,168,128,0.3)] hover:scale-102"
              >
                <MessageCircle className="h-5 w-5" />
                ENQUIRE NOW VIA WHATSAPP
              </a>
              <p className="mt-3 text-xs text-gray-500 flex items-center gap-1.5 justify-center sm:justify-start">
                <Award className="h-4 w-4 text-luxury-gold" />
                Concierge assistance is available to discuss custom specifications and delivery.
              </p>
            </div>

            {/* Divider */}
            <div className="my-8 border-b border-luxury-gray/40" />

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div>
                <h3 className="flex items-center gap-2 font-serif text-sm font-semibold tracking-widest text-white uppercase mb-4">
                  <ListCollapse className="h-4 w-4 text-luxury-gold" />
                  SPECIFICATIONS
                </h3>
                <div className="rounded border border-luxury-gray bg-[#090909] overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <tbody>
                      {product.specifications.map((spec, idx: number) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-[#0f0f0f]' : 'bg-[#090909]'}
                        >
                          <td className="px-4 py-3 font-semibold text-gray-400 w-1/3 border-b border-luxury-gray/40 uppercase tracking-wider">
                            {spec.key}
                          </td>
                          <td className="px-4 py-3 text-white border-b border-luxury-gray/40">
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

        {/* Full description */}
        <div className="mt-20 border-t border-luxury-gray/40 pt-12">
          <h2 className="font-serif text-xl sm:text-2xl font-semibold tracking-widest text-white uppercase mb-6">
            PRODUCT DETAILS
          </h2>
          <div className="max-w-4xl text-gray-400 leading-relaxed font-light whitespace-pre-wrap">
            {product.fullDescription}
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviews reviews={reviews} stats={stats} />
      </section>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-luxury-gray/40 bg-luxury-dark/10 py-16 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="font-serif text-xl sm:text-2xl font-semibold tracking-widest text-white uppercase mb-8">
              RELATED PRODUCTS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((prod: Product) => {
                const imageUrl = getImageUrl(prod.image as Media | number)
                return (
                  <div
                    key={prod.id}
                    className="flex flex-col p-4 sm:p-6 border border-border rounded-2xl bg-card hover:border-[#F5B82A] hover:-translate-y-1 transition-all duration-300 relative group gap-4 sm:gap-6"
                  >
                    <Link href={`/product/${prod.slug}`} className="flex flex-col flex-grow gap-4 sm:gap-6">
                      {/* Image Frame */}
                      <div className="relative flex items-center justify-center w-full bg-[#0e0e0e] rounded-lg aspect-square overflow-hidden">
                        {/* Badges */}
                        {(() => {
                          const isNew = new Date(prod.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
                          return (
                            <>
                              {isNew && (
                                <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-[#F5B82A] text-black px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest z-10">
                                  NEW
                                </span>
                              )}
                              {prod.limitedEdition && (
                                <span className="absolute top-3 right-3 sm:top-4 sm:right-4 border border-[#F5B82A]/40 text-[#F5B82A] px-2 py-1 sm:px-3 sm:py-1.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-widest z-10">
                                  LIMITED EDITION
                                </span>
                              )}
                            </>
                          );
                        })()}
                        <Image
                          src={imageUrl}
                          alt={prod.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      {/* Product Info Section */}
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-[12px] font-bold text-[#F5B82A] uppercase tracking-[0.15em]">
                            {typeof prod.brand === 'object' && prod.brand !== null ? (prod.brand as Brand).title : String(prod.brand)}
                            {typeof prod.brand === 'object' && prod.brand !== null && (prod.brand as Brand).verified && (
                              <BadgeCheck className="w-3.5 h-3.5 text-[#F5B82A]" />
                            )}
                          </div>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold text-white leading-tight">
                          {prod.title}
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2 line-clamp-2">
                          {prod.shortDescription}
                        </p>

                        {/* Specifications Row */}
                        {prod.specifications && prod.specifications.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 text-[10px] sm:text-[11px] text-gray-400 font-medium">
                            {prod.specifications.slice(0, 3).map((spec: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#F5B82A]" />
                                {spec.value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Actions */}
                    <div className="mt-auto pt-2 flex gap-3">
                      <AddToCartButton product={prod as Product} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Mobile WhatsApp CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 block sm:hidden border-t border-luxury-gray bg-luxury-black/95 backdrop-blur-md px-4 py-3 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-black border border-luxury-gray flex items-center justify-center">
              <Image
                src={getImageUrl(product.image)}
                alt={product.title}
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-serif font-bold text-luxury-gold uppercase truncate">{typeof product.brand === 'object' && product.brand !== null ? (product.brand as Brand).title : String(product.brand)}</p>
              <p className="text-xs font-medium text-white truncate max-w-[130px]">{product.title}</p>
            </div>
          </div>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded bg-luxury-gold px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-luxury-black transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            ENQUIRE
          </a>
        </div>
      </div>
    </div>
  )
}
