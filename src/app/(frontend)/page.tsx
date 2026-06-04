import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/services/categories'
import { getProducts } from '@/services/products'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category } from '@/payload-types'

export const revalidate = 60 // Revalidate cache every 60 seconds

export default async function HomePage() {
  const categories = await getCategories()
  const { products: featuredProducts } = await getProducts({ featured: true, limit: 8 })

  // If no categories or products exist yet, render a beautiful Seeding Prompt
  if (categories.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="max-w-md rounded-lg border border-luxury-gray bg-luxury-dark p-8 shadow-2xl">
          <h2 className="font-serif text-3xl font-bold text-white">Luxury Showcase Empty</h2>
          <p className="mt-4 text-sm text-gray-400">
            Welcome to the ReviewCartDeals Luxury Product Showcase. The database is currently empty.
          </p>
          <div className="mt-8">
            <div className="inline-flex items-center gap-2 rounded bg-luxury-dark border border-luxury-gray px-6 py-3 font-semibold text-gray-300">
              <span className="font-mono text-luxury-gold">bun run seed</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Run the command above in your terminal to automatically upload high-quality mock images and populate categories and products.
          </p>
        </div>
      </div>
    )
  }

  // Fetch watches specifically for the WATCH showcase banner
  const { products: watches } = await getProducts({ categorySlug: 'watch', limit: 3 })

  return (
    <div className="w-full">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden border-b border-luxury-gray">
        {/* Desktop Image */}
        <Image
          src="/seed/hero_luxury.webp"
          alt="Luxury Accessories Hero"
          fill
          priority
          sizes="100vw"
          className="hidden sm:block object-cover opacity-60"
        />
        {/* Mobile Image */}
        <Image
          src="/seed/hero_luxury_mobile.webp"
          alt="Luxury Accessories Hero Mobile"
          fill
          priority
          sizes="100vw"
          className="block sm:hidden object-cover opacity-60 object-center"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-black/40" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
          <div className="max-w-2xl text-left">
            <p className="text-xs font-semibold tracking-widest text-luxury-gold uppercase">
              Premium Accessories. Trusted Reviews. Unbeatable Deals.
            </p>
            <h1 className="mt-4 font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-white tracking-tight leading-none">
              STYLE THAT <br />
              DEFINES <span className="gold-text-gradient">WHO YOU ARE</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-lg leading-relaxed font-light">
              Explore expert reviews and exclusive deals on watches, sunglasses, bags & more. Contact us directly on WhatsApp for premium service.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/search"
                className="rounded bg-luxury-gold px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-luxury-black hover:bg-luxury-gold-hover transition-all duration-300"
              >
                Explore Showcase
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'}?text=${encodeURIComponent(
                  'Hello, I am interested in browsing your luxury showcase. Can you share some premium options?'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-white bg-transparent px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-white hover:text-luxury-black transition-all duration-300"
              >
                Chat Concierge
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Premium Watch Showcase Banner */}
      {watches.length > 0 && (
        <section className="py-16 bg-luxury-black border-b border-luxury-gray">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h3 className="text-center font-serif text-2xl sm:text-3xl font-semibold tracking-widest text-white uppercase">
              Premium Watches
            </h3>
            
            {/* Curved Gray Box containing watches */}
            <div className="mt-10 rounded-2xl border border-luxury-gray bg-luxury-dark/40 p-8 sm:p-12 hover-gold-glow">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                {watches.map((watch: Product) => {
                  const imageUrl = getImageUrl(watch.image)
                  return (
                    <Link
                      key={watch.id}
                      href={`/product/${watch.slug}`}
                      className="group flex flex-col items-center text-center"
                    >
                      <div className="relative h-48 w-48 overflow-hidden rounded bg-black flex items-center justify-center">
                        <Image
                          src={imageUrl}
                          alt={watch.title}
                          width={180}
                          height={180}
                          className="object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <h4 className="mt-4 font-serif text-sm font-semibold tracking-widest text-luxury-gold uppercase group-hover:text-white transition-colors">
                        {watch.brand}
                      </h4>
                      <p className="mt-1 text-xs text-gray-500 max-w-[180px] line-clamp-1">
                        {watch.title}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Featured Categories */}
      <section className="py-20 bg-luxury-black border-b border-luxury-gray">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-semibold tracking-widest text-white uppercase">
            CATEGORIES
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-5">
            {categories.map((cat: Category) => {
              const imageUrl = getImageUrl(cat.image)
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group flex flex-col items-center bg-[#0d0d0d] border border-luxury-gray/40 rounded p-4 text-center hover:border-luxury-gold transition-all duration-300"
                >
                  <div className="relative h-32 w-32 overflow-hidden rounded bg-black flex items-center justify-center">
                    <Image
                      src={imageUrl}
                      alt={cat.title}
                      width={100}
                      height={100}
                      className="object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="mt-4 text-xs font-semibold tracking-widest text-gray-400 group-hover:text-luxury-gold transition-colors uppercase">
                    {cat.title}
                  </h3>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. Products You May Like */}
      <section className="py-20 bg-luxury-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row border-b border-luxury-gray/40 pb-6 mb-12">
            <h2 className="font-serif text-3xl font-semibold tracking-widest text-white uppercase">
              PRODUCT YOU MAY LIKE
            </h2>
            <Link
              href="/search"
              className="group flex items-center gap-1 text-xs font-semibold tracking-widest text-luxury-gold hover:text-white transition-colors"
            >
              BROWSE ALL PRODUCTS
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {featuredProducts.map((prod: Product) => {
              const imageUrl = getImageUrl(prod.image)
              return (
                <div
                  key={prod.id}
                  className="group relative flex flex-col rounded border border-luxury-gray bg-[#0c0c0c] p-4 hover-gold-glow transition-all duration-300"
                >
                  <Link href={`/product/${prod.slug}`} className="flex-grow flex flex-col">
                    {/* Image Box */}
                    <div className="relative aspect-square w-full overflow-hidden rounded bg-black flex items-center justify-center">
                      <Image
                        src={imageUrl}
                        alt={prod.title}
                        width={200}
                        height={200}
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Meta */}
                    <h3 className="mt-4 font-serif text-xs font-semibold tracking-widest text-luxury-gold uppercase">
                      {prod.brand}
                    </h3>
                    <h4 className="mt-1 text-sm font-medium text-white line-clamp-1 group-hover:text-luxury-gold transition-colors">
                      {prod.title}
                    </h4>
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                      {prod.shortDescription}
                    </p>
                  </Link>

                  {/* Quick Enquiry CTA */}
                  <div className="mt-4 border-t border-luxury-gray/40 pt-4">
                    <a
                      href={`https://wa.me/${
                        process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '1234567890'
                      }?text=${encodeURIComponent(
                        `Hello,\n\nI am interested in this product:\n\nProduct Name: ${prod.title}\nProduct URL: ${
                          process.env.NEXT_PUBLIC_SITE_URL || 'https://reviewcartdeals.com'
                        }/product/${prod.slug}\n\nPlease share more details.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-1.5 rounded bg-luxury-gold/10 hover:bg-luxury-gold border border-luxury-gold/30 hover:border-luxury-gold py-2 text-[10px] font-bold tracking-widest text-luxury-gold hover:text-luxury-black transition-all duration-300"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      ENQUIRE NOW
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-16 flex justify-center">
            <Link
              href="/search"
              className="rounded-full border border-luxury-gold px-8 py-3 text-xs font-semibold uppercase tracking-widest text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all duration-300"
            >
              NEXT PAGE &gt;
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
