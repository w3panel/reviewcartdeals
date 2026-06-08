import React, { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/services/categories'
import { getBuildSlugs } from '@/lib/buildSlugs'
import { ChevronLeft } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'
import { CategoryProducts } from './CategoryProducts'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    q?: string
    brand?: string
    page?: string
  }>
}

export const revalidate = 60

export async function generateStaticParams() {
  const { categorySlugs } = await getBuildSlugs()
  return categorySlugs.map((slug) => ({ slug }))
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const bannerImageUrl = getImageUrl(category.image)

  return (
    <div className="w-full min-h-screen bg-background pb-20 md:pb-12">
      <section className="relative h-[30vh] sm:h-[40vh] w-full overflow-hidden border-b border-border">
        <Image
          src={bannerImageUrl}
          alt={category.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-12 mx-auto max-w-7xl">
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-semibold tracking-widest text-primary uppercase hover:text-foreground transition-colors mb-3 sm:mb-4"
          >
            <ChevronLeft className="h-4 w-4" /> Back to catalog
          </Link>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-wide">
            {category.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense
          fallback={<div className="py-20 text-center text-gray-500">Loading products...</div>}
        >
          <CategoryProducts slug={slug} searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  )
}
