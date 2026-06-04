import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { 
  Search, SlidersHorizontal, ArrowUpDown, Tag as TagIcon, Star, Sparkles, 
  ChevronUp, ChevronDown, LayoutGrid, BadgeCheck, Heart, ScanLine
} from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import type { Product, Category, Brand } from '@/payload-types'
import { AddToCartButton } from '@/components/AddToCartButton'

export const revalidate = 60

export default async function HomePage() {
  const categories = await getCategories()
  const { products: allProducts } = await getProducts({ limit: 12 })
  const brands = await getAllBrands()

  if (categories.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center bg-[#050505]">
        <h2 className="font-serif text-3xl font-bold text-[#D4AF37]">Database Empty</h2>
        <p className="mt-4 text-sm text-gray-400">Run `bun run seed` to populate data.</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#050505] pb-8 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Search Bar */}
        <div className="px-4 pt-4 md:pt-8 max-w-4xl mx-auto">
          <div className="relative flex items-center w-full px-4 py-3.5 border rounded-2xl bg-[#111111] border-[#D4AF37]/20 focus-within:border-[#D4AF37] shadow-sm transition-colors">
            <Search className="w-5 h-5 text-[#D4AF37] font-bold mr-2" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search premium collections..."
              className="w-full px-2 text-sm text-white bg-transparent outline-none placeholder:text-[#888888] font-medium"
            />
            <ScanLine className="w-5 h-5 text-[#D4AF37]/70 ml-2 cursor-pointer hover:text-[#D4AF37] transition-colors" />
          </div>
        </div>

        {/* Hero Banners */}
        <div className="px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Banner */}
            <div className="md:col-span-2 relative flex flex-col justify-center p-6 md:p-10 min-h-[180px] md:min-h-[220px] overflow-hidden rounded-3xl bg-gradient-to-r from-[#1A1A1A] to-[#0A0A0A] border border-[#D4AF37]/10 shadow-lg">
              <div className="z-10 max-w-sm">
                <h2 className="flex flex-col gap-1 font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#D4AF37] leading-tight">
                  <span>Exclusive Deals</span>
                  <span className="text-gray-300 font-normal text-xl md:text-2xl mt-1">Curated Excellence <Sparkles className="inline w-5 h-5 text-[#D4AF37] ml-1" /></span>
                </h2>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-6 py-2.5 mt-6 text-xs font-bold text-black bg-[#D4AF37] hover:bg-[#C5A059] rounded-full transition-colors w-fit shadow-md tracking-wider uppercase"
                >
                  Discover Now &rarr;
                </Link>
              </div>
              {/* Decorative shapes / image */}
              <div className="absolute right-0 top-0 w-3/4 md:w-1/2 h-full pointer-events-none bg-[url('/seed/hero_luxury_mobile.webp')] bg-cover mix-blend-screen opacity-70" style={{ backgroundPosition: 'center right' }}></div>
            </div>
            
            {/* Side Banners */}
            <div className="flex flex-row md:flex-col gap-4">
              <div className="flex-1 relative flex items-center justify-between p-5 md:p-6 overflow-hidden rounded-3xl bg-[#111111] shadow-sm border border-[#D4AF37]/20 group cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-[#D4AF37] uppercase tracking-wide">Signature</h3>
                  <p className="text-xs text-gray-400 mt-1">Up to 70% Off</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#AA8C49] rounded-full text-black shadow-sm">
                  <span className="font-serif text-lg md:text-xl font-bold">%</span>
                </div>
              </div>
              <div className="flex-1 relative flex items-center justify-between p-5 md:p-6 overflow-hidden rounded-3xl bg-[#111111] shadow-sm border border-[#D4AF37]/20 group cursor-pointer hover:border-[#D4AF37]/50 transition-all">
                <div>
                  <h3 className="text-sm md:text-base font-bold text-[#D4AF37] uppercase tracking-wide">Top Rated</h3>
                  <p className="text-xs text-gray-400 mt-1">Masterpieces</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#AA8C49] rounded-full text-black shadow-sm">
                  <Star className="w-4 h-4 md:w-5 md:h-5 fill-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Categories Row */}
        <div className="mt-10 px-4">
          <div className="flex space-x-6 md:space-x-8 overflow-x-auto no-scrollbar pb-4 items-center justify-start md:justify-center">
            <Link href="/search" className="flex flex-col items-center flex-shrink-0 gap-3 group">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#111111] shadow-lg text-[#D4AF37] group-hover:bg-[#1A1A1A] group-hover:scale-105 transition-all border border-[#D4AF37]/30">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 group-hover:text-[#D4AF37] transition-colors">All</span>
            </Link>

            {categories.map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center flex-shrink-0 gap-3 group"
              >
                <div className="relative flex items-center justify-center w-16 h-16 p-3 overflow-hidden rounded-full bg-[#111111] shadow-lg group-hover:scale-105 transition-all border border-[#D4AF37]/30 group-hover:border-[#D4AF37]/60">
                  <Image
                    src={getImageUrl(cat.image)}
                    alt={cat.title}
                    width={32}
                    height={32}
                    className="object-contain transition-all"
                  />
                </div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 group-hover:text-[#D4AF37] transition-colors">
                  {cat.title}
                </span>
              </Link>
            ))}
            
            {/* "More" placeholder icon */}
            <Link href="/search" className="flex flex-col items-center flex-shrink-0 gap-3 group">
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-[#111111] shadow-lg group-hover:scale-105 transition-all text-[#D4AF37] border border-[#D4AF37]/30">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-400 group-hover:text-[#D4AF37] transition-colors">More</span>
            </Link>
          </div>
        </div>

        {/* Filter / Sort Horizontal Bar */}
        <div className="px-4 mt-8">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-black bg-[#D4AF37] rounded-full flex-shrink-0 shadow-lg hover:bg-[#C5A059] transition-all uppercase tracking-wide">
              <SlidersHorizontal className="w-4 h-4" /> Filters <span className="w-1.5 h-1.5 rounded-full bg-black ml-1"></span>
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-300 bg-[#111111] border border-[#D4AF37]/30 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex-shrink-0 uppercase tracking-wide">
              <ArrowUpDown className="w-4 h-4" /> Sort
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-300 bg-[#111111] border border-[#D4AF37]/30 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex-shrink-0 uppercase tracking-wide">
              <TagIcon className="w-4 h-4" /> Brand
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-gray-300 bg-[#111111] border border-[#D4AF37]/30 rounded-full hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors flex-shrink-0 uppercase tracking-wide">
              <span className="font-serif italic font-bold">$</span> Price
            </button>
            <div className="ml-auto pl-4">
              <button className="text-sm font-bold text-[#D4AF37] hover:text-white transition-colors flex-shrink-0 uppercase tracking-wider">
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Split: Sidebar + Product Grid */}
        <div className="px-4 mt-8 flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar (Desktop/Tablet) */}
          <div className="hidden md:block w-64 lg:w-72 flex-shrink-0 space-y-6">
            {/* Categories Accordion */}
            <div className="bg-[#111111] p-5 rounded-3xl border border-[#D4AF37]/10">
              <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex justify-between items-center mb-5 cursor-pointer">
                Collections
                <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
              </h3>
              <div className="space-y-2">
                <Link href="/search" className="flex items-center gap-3 px-4 py-3 bg-[#D4AF37] text-black rounded-xl font-bold text-xs tracking-wide shadow-sm">
                  <LayoutGrid className="w-4 h-4" />
                  ALL COLLECTIONS
                </Link>
                {categories.map((cat: Category) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#D4AF37] hover:bg-[#1A1A1A] rounded-xl transition-all text-xs font-semibold tracking-wide uppercase group">
                    <div className="w-4 h-4 relative opacity-70 group-hover:opacity-100 transition-opacity">
                      <Image src={getImageUrl(cat.image)} alt="" fill className="object-contain" />
                    </div>
                    {cat.title}
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-[#111111] p-5 rounded-3xl border border-[#D4AF37]/10">
              <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-wider flex justify-between items-center mb-5 cursor-pointer">
                Designer Brands
                <ChevronUp className="w-4 h-4 text-[#D4AF37]" />
              </h3>
              <div className="space-y-4 px-2">
                {brands.slice(0, 6).map(brand => (
                  <label key={brand} className="flex items-center gap-4 cursor-pointer group">
                    <div className="w-5 h-5 border border-[#D4AF37]/40 rounded-[4px] flex items-center justify-center bg-transparent group-hover:border-[#D4AF37] transition-colors relative">
                       <div className="w-3 h-3 bg-[#D4AF37] rounded-[2px] opacity-0 group-hover:opacity-20" />
                    </div>
                    <span className="text-gray-300 font-semibold text-xs tracking-wide uppercase group-hover:text-[#D4AF37] transition-colors">{brand}</span>
                  </label>
                ))}
                <button className="flex items-center gap-2 text-[#D4AF37] hover:text-white text-xs font-bold pt-2 transition-colors uppercase tracking-wider">
                  View More <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Product List Header */}
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#D4AF37]/10">
              <span className="text-xs tracking-wider uppercase font-semibold text-[#D4AF37]">{allProducts.length} Curated Pieces</span>
              <div className="flex items-center gap-2 cursor-pointer group">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Sort by:</span>
                <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors uppercase tracking-wider">Exclusivity</span>
                <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {allProducts.map((prod: Product) => (
                <div
                  key={prod.id}
                  className="flex flex-col p-4 md:p-5 border border-[#D4AF37]/20 rounded-3xl bg-[#111111] hover:border-[#D4AF37]/60 transition-all shadow-lg hover:shadow-[0_4px_20px_rgba(212,175,55,0.1)] relative group"
                >
                  <button className="absolute top-4 right-4 z-10 text-gray-500 hover:text-[#D4AF37] transition-colors p-1 rounded-full">
                    <Heart className="w-5 h-5" />
                  </button>
                  <Link href={`/product/${prod.slug}`} className="flex flex-col flex-grow">
                    <div className="relative flex items-center justify-center w-full bg-[#1A1A1A] rounded-2xl aspect-square mb-5 overflow-hidden border border-gray-800">
                      <Image
                        src={getImageUrl(prod.image)}
                        alt={prod.title}
                        width={200}
                        height={200}
                        className="object-contain p-2 transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-[#D4AF37] mb-2">
                      {typeof prod.brand === 'object' && prod.brand !== null ? (prod.brand as Brand).title : String(prod.brand)}
                      <BadgeCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                    </div>
                    <h3 className="text-sm md:text-base font-serif font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#D4AF37] transition-colors">
                      {prod.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mt-3 mb-4">
                      <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-[#D4AF37]" />
                      <span className="text-xs font-bold text-white">{(prod as any).rating || '4.7'}</span>
                      <span className="text-[11px] text-gray-500">({(prod as any).reviewsCount || '1.2k'} reviews)</span>
                    </div>
                  </Link>
                  <div className="mt-auto pt-2">
                    <AddToCartButton product={prod} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
