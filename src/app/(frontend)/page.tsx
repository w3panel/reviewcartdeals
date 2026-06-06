import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { getProductReviews } from '@/services/reviews'
import { 
  Search, SlidersHorizontal, ArrowUpDown, Tag as TagIcon, Star, Sparkles, 
  ChevronUp, ChevronDown, LayoutGrid, BadgeCheck, ScanLine, MoreHorizontal
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category, Brand, Media } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'
import { FrontPageCatalog } from './FrontPageCatalog'
export const revalidate = 60

export default async function HomePage() {
  const categories = await getCategories()
  const { products: allProducts, totalDocs } = await getProducts({ limit: 12 })
  const brands = await getAllBrands()

  const productsWithStats = await Promise.all(allProducts.map(async (prod) => {
    const { stats } = await getProductReviews(prod.id)
    return { ...prod, stats }
  }))

  const featuredCat1 = categories[0]
  const featuredCat2 = categories[1] || categories[0]
  const featuredCat3 = categories[2] || categories[0]

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center bg-background">
        <h2 className="font-sans text-3xl font-bold text-primary">Database Empty</h2>
        <p className="mt-4 text-sm text-gray-400">Run `bun run seed` to populate data.</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-background pb-8 text-foreground min-h-screen font-sans bg-[url('/noise.png')] bg-repeat">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Bar */}
        <div className="px-4 pt-4 md:pt-6 max-w-4xl mx-auto">
          <div className="relative flex items-center w-full px-5 py-3 border rounded-full bg-card border-[#F5B82A] focus-within:border-[#F5B82A] shadow-sm transition-colors">
            <Search className="w-5 h-5 text-[#F5B82A] font-bold mr-3" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search products, brands & categories..."
              className="w-full text-[13px] text-foreground bg-transparent outline-none placeholder:text-gray-500 font-medium"
            />
            <ScanLine className="w-5 h-5 text-[#F5B82A] ml-2 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Hero Banners */}
        <div className="px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Banner */}
            <div className="md:col-span-2 relative flex flex-col justify-center p-6 md:p-8 min-h-[160px] md:min-h-[200px] overflow-hidden rounded-2xl bg-[#080808] border border-transparent">
              <div className="z-10 max-w-sm">
                <h2 className="flex flex-col gap-1 text-2xl md:text-3xl font-bold leading-tight">
                  <span className="text-[#F5B82A]">{featuredCat1?.title || 'Best Deals'}</span>
                  <span className="text-white font-medium mt-1 line-clamp-2">{featuredCat1?.description || 'Handpicked for You!'} <Sparkles className="inline w-5 h-5 text-[#F5B82A] ml-1" /></span>
                </h2>
                <Link
                  href={featuredCat1 ? `/category/${featuredCat1.slug}` : "/search"}
                  className="inline-flex items-center gap-2 px-6 py-2 mt-5 text-sm font-semibold text-black bg-white hover:bg-gray-200 border border-[#F5B82A] rounded-full transition-colors w-fit"
                >
                  Shop Now &rarr;
                </Link>
              </div>
              {/* Decorative shapes / image */}
              <div className="absolute right-0 top-0 w-3/4 md:w-1/2 h-full pointer-events-none bg-[url('/seed/hero_luxury_mobile.webp')] bg-cover opacity-90" style={{ backgroundPosition: 'center right' }}></div>
            </div>
            
            {/* Side Banners */}
            <div className="flex flex-col gap-4">
              <Link href={featuredCat2 ? `/category/${featuredCat2.slug}` : "/search"} className="flex-1 relative flex items-center justify-between p-5 overflow-hidden rounded-2xl bg-card border border-[#F5B82A]/30 cursor-pointer hover:bg-muted transition-colors">
                <div>
                  <h3 className="text-[15px] font-medium text-[#F5B82A]">{featuredCat2?.title || 'Mega Deals'}</h3>
                  <p className="text-[13px] text-gray-300 mt-1 line-clamp-1">{featuredCat2?.description || 'Up to 70% Off'}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/30 rounded-full text-primary backdrop-blur-sm">
                  <span className="text-xl font-bold">%</span>
                </div>
              </Link>
              <Link href={featuredCat3 ? `/category/${featuredCat3.slug}` : "/search"} className="flex-1 relative flex items-center justify-between p-5 overflow-hidden rounded-2xl bg-card border border-[#F5B82A]/30 cursor-pointer hover:bg-muted transition-colors">
                <div>
                  <h3 className="text-[15px] font-medium text-[#F5B82A]">{featuredCat3?.title || 'Top Rated'}</h3>
                  <p className="text-[13px] text-gray-300 mt-1 line-clamp-1">{featuredCat3?.description || 'Products'}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 border border-[#F5B82A]/50 rounded-full text-[#F5B82A] backdrop-blur-sm">
                  <Star className="w-6 h-6 fill-[#F5B82A] text-[#F5B82A]" />
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Horizontal Categories Row */}
        <div className="mt-8 px-4">
          <div className="flex space-x-6 md:space-x-8 overflow-x-auto no-scrollbar pb-6 items-start justify-start md:justify-center">
            <Link href="/search" className="flex flex-col items-center flex-shrink-0 gap-4 group transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-card border border-[#F5B82A] p-1 group-hover:shadow-[0_8px_24px_rgba(245,184,42,0.2)] transition-shadow">
                <div className="flex items-center justify-center w-full h-full rounded-full bg-[#F5B82A]">
                  <LayoutGrid className="w-8 h-8 text-black" />
                </div>
              </div>
              <span className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em]">All</span>
            </Link>

            {categories.slice(0, 6).map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center flex-shrink-0 gap-4 group transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-card border border-[#F5B82A] p-1 group-hover:shadow-[0_8px_24px_rgba(245,184,42,0.2)] transition-shadow">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-muted">
                    <Image
                      src={getImageUrl(cat.image)}
                      alt={cat.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em]">
                  {cat.title}
                </span>
              </Link>
            ))}
            
            {/* "More" placeholder icon */}
            {categories.length > 6 && (
              <Link href="/search" className="flex flex-col items-center flex-shrink-0 gap-4 group transition-transform duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-center w-[80px] h-[80px] rounded-full bg-card border border-[#F5B82A] p-1 group-hover:shadow-[0_8px_24px_rgba(245,184,42,0.2)] transition-shadow">
                  <div className="flex items-center justify-center w-full h-full rounded-full bg-gray-200 dark:bg-gray-800">
                    <MoreHorizontal className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
                <span className="text-[11px] font-bold text-foreground uppercase tracking-[0.2em]">More</span>
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic Client-Side Catalog */}
        <FrontPageCatalog 
          categories={categories} 
          brands={brands} 
          initialProducts={productsWithStats} 
          initialTotalDocs={totalDocs} 
        />
      </div>
    </div>
  )
}
