import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/services/categories'
import { getProducts, getAllBrands } from '@/services/products'
import { 
  Search, SlidersHorizontal, ArrowUpDown, Tag as TagIcon, Star, Sparkles, 
  ChevronUp, ChevronDown, LayoutGrid, BadgeCheck, Heart, ScanLine, MoreHorizontal
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
          <div className="relative flex items-center w-full px-5 py-3 border rounded-full bg-card border-primary/40 focus-within:border-primary shadow-sm transition-colors">
            <Search className="w-5 h-5 text-primary font-bold mr-3" strokeWidth={2.5} />
            <input
              type="text"
              placeholder="Search products, brands & categories..."
              className="w-full text-[13px] text-foreground bg-transparent outline-none placeholder:text-gray-500 font-medium"
            />
            <ScanLine className="w-5 h-5 text-primary ml-2 cursor-pointer transition-colors" />
          </div>
        </div>

        {/* Hero Banners */}
        <div className="px-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Banner */}
            <div className="md:col-span-2 relative flex flex-col justify-center p-6 md:p-8 min-h-[160px] md:min-h-[200px] overflow-hidden rounded-2xl bg-card border border-primary/20">
              <div className="z-10 max-w-sm">
                <h2 className="flex flex-col gap-1 text-2xl md:text-3xl font-bold leading-tight">
                  <span className="text-primary">Best Deals</span>
                  <span className="text-foreground font-medium mt-1">Handpicked for You! <Sparkles className="inline w-5 h-5 text-primary ml-1" /></span>
                </h2>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-6 py-2 mt-5 text-sm font-semibold text-background bg-primary hover:bg-primary-hover rounded-full transition-colors w-fit"
                >
                  Shop Now &rarr;
                </Link>
              </div>
              {/* Decorative shapes / image */}
              <div className="absolute right-0 top-0 w-3/4 md:w-1/2 h-full pointer-events-none bg-[url('/seed/hero_luxury_mobile.webp')] bg-cover opacity-90" style={{ backgroundPosition: 'center right' }}></div>
            </div>
            
            {/* Side Banners */}
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative flex items-center justify-between p-5 overflow-hidden rounded-2xl bg-card border border-primary/20 cursor-pointer">
                <div>
                  <h3 className="text-[15px] font-medium text-primary">Mega Deals</h3>
                  <p className="text-[13px] text-gray-300 mt-1">Up to 70% Off</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/30 rounded-full text-primary backdrop-blur-sm">
                  <span className="text-xl font-bold">%</span>
                </div>
              </div>
              <div className="flex-1 relative flex items-center justify-between p-5 overflow-hidden rounded-2xl bg-card border border-primary/20 cursor-pointer">
                <div>
                  <h3 className="text-[15px] font-medium text-primary">Top Rated</h3>
                  <p className="text-[13px] text-gray-300 mt-1">Products</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 border border-primary/30 rounded-full text-primary backdrop-blur-sm">
                  <Star className="w-6 h-6 fill-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Categories Row */}
        <div className="mt-8 px-4">
          <div className="flex space-x-6 md:space-x-8 overflow-x-auto no-scrollbar pb-4 items-center justify-start md:justify-center">
            <Link href="/search" className="flex flex-col items-center flex-shrink-0 gap-3 group">
              <div className="flex items-center justify-center w-[60px] h-[60px] rounded-full bg-transparent border border-primary/50 text-primary group-hover:bg-primary/10 transition-all">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">All</span>
            </Link>

            {categories.map((cat: Category) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex flex-col items-center flex-shrink-0 gap-3 group"
              >
                <div className="relative flex items-center justify-center w-[60px] h-[60px] p-3 overflow-hidden rounded-full bg-transparent border border-primary/50 group-hover:bg-primary/10 transition-all">
                  <Image
                    src={getImageUrl(cat.image)}
                    alt={cat.title}
                    width={32}
                    height={32}
                    className="object-contain transition-all grayscale brightness-200 contrast-200 sepia hue-rotate-[10deg] saturate-200"
                  />
                </div>
                <span className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">
                  {cat.title}
                </span>
              </Link>
            ))}
            
            {/* "More" placeholder icon */}
            <Link href="/search" className="flex flex-col items-center flex-shrink-0 gap-3 group">
              <div className="flex flex-col items-center justify-center w-[60px] h-[60px] rounded-full bg-transparent border border-primary/50 text-primary group-hover:bg-primary/10 transition-all">
                <MoreHorizontal className="w-6 h-6" />
              </div>
              <span className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">More</span>
            </Link>
          </div>
        </div>

        {/* Filter / Sort Horizontal Bar */}
        <div className="px-4 mt-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-foreground bg-transparent border border-primary/40 rounded-full flex-shrink-0 hover:bg-primary/10 transition-all relative">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
              <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-primary"></span>
            </button>
            <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-foreground bg-transparent border border-gray-700 rounded-full hover:border-primary/40 transition-colors flex-shrink-0">
              <ArrowUpDown className="w-4 h-4 text-primary" /> Sort
            </button>
            <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-foreground bg-transparent border border-gray-700 rounded-full hover:border-primary/40 transition-colors flex-shrink-0">
              <TagIcon className="w-4 h-4 text-primary" /> Brand
            </button>
            <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-medium text-foreground bg-transparent border border-gray-700 rounded-full hover:border-primary/40 transition-colors flex-shrink-0">
              <span className="font-semibold text-primary">$</span> Price
            </button>
            <div className="ml-auto pl-4">
              <button className="text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors flex-shrink-0">
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Split: Sidebar + Product Grid */}
        <div className="px-4 mt-6 flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar (Desktop/Tablet) */}
          <div className="hidden md:block w-64 lg:w-72 flex-shrink-0 space-y-6">
            {/* Categories Accordion */}
            <div className="bg-transparent border border-gray-800 p-4 rounded-2xl">
              <h3 className="text-[15px] font-medium text-primary flex justify-between items-center mb-4 cursor-pointer">
                Categories
                <ChevronUp className="w-4 h-4 text-primary" />
              </h3>
              <div className="space-y-1">
                <Link href="/search" className="flex items-center gap-3 px-3 py-2.5 bg-transparent border border-primary text-primary rounded-xl font-medium text-[13px] shadow-sm">
                  <LayoutGrid className="w-4 h-4" />
                  All Categories
                </Link>
                {categories.map((cat: Category) => (
                  <Link key={cat.id} href={`/category/${cat.slug}`} className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-primary hover:bg-muted rounded-xl transition-all text-[13px] font-medium group">
                    <div className="w-4 h-4 relative">
                      <Image src={getImageUrl(cat.image)} alt="" fill className="object-contain grayscale brightness-200" />
                    </div>
                    {cat.title}
                  </Link>
                ))}
                <button className="flex items-center justify-between w-full text-primary text-[13px] font-medium mt-2 pt-2 px-3 transition-colors">
                  Show More <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-transparent border border-gray-800 p-4 rounded-2xl">
              <h3 className="text-[15px] font-medium text-primary flex justify-between items-center mb-4 cursor-pointer">
                Brands
                <ChevronUp className="w-4 h-4 text-primary" />
              </h3>
              <div className="space-y-4 px-3">
                {brands.slice(0, 6).map(brand => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 border border-gray-600 rounded-[3px] flex items-center justify-center bg-transparent group-hover:border-primary transition-colors" />
                    <span className="text-gray-300 font-medium text-[13px] group-hover:text-foreground transition-colors">{brand}</span>
                  </label>
                ))}
                <button className="flex items-center justify-between w-full text-primary text-[13px] font-medium mt-2 pt-2 transition-colors">
                  View More <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1">
            {/* Product List Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-primary">1,248 Products found</span>
              <div className="flex items-center gap-1 cursor-pointer group">
                <span className="text-[13px] text-gray-400">Sort by:</span>
                <span className="text-[13px] font-medium text-primary">Popular</span>
                <ChevronDown className="w-4 h-4 text-primary" />
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {allProducts.map((prod: Product) => (
                <div
                  key={prod.id}
                  className="flex flex-col p-4 border border-gray-800 rounded-2xl bg-card hover:border-primary/40 transition-all relative group"
                >
                  <button className="absolute top-4 right-4 z-10 text-primary opacity-70 hover:opacity-100 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <Link href={`/product/${prod.slug}`} className="flex flex-col flex-grow">
                    <div className="relative flex items-center justify-center w-full bg-card rounded-xl aspect-square mb-4">
                      <Image
                        src={getImageUrl(prod.image)}
                        alt={prod.title}
                        width={180}
                        height={180}
                        className="object-contain p-2 transition-transform duration-500 group-hover:scale-105 drop-shadow-xl"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-gray-300 mb-1">
                      {typeof prod.brand === 'object' && prod.brand !== null ? (prod.brand as Brand).title : String(prod.brand)}
                      <BadgeCheck className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="text-[13px] font-normal text-foreground line-clamp-2 leading-relaxed mt-1">
                      {prod.title}
                    </h3>
                    
                    <div className="flex items-center gap-1.5 mt-2 mb-2">
                      <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                      <span className="text-xs font-medium text-primary">{(prod as any).rating || '4.7'}</span>
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
