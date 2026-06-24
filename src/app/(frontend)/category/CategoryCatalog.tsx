'use client'

import Link from 'next/link'
import { SafeImage } from '@/components/SafeImage'
import { CatalogLoadMore } from '@/components/CatalogLoadMore'
import { InfiniteScrollSentinel } from '@/components/InfiniteScrollSentinel'
import { useInfiniteCategories } from '@/hooks/useInfiniteCategories'
import { getImageUrl } from '@/lib/utils'
import type { Category } from '@/payload-types'

type CategoryCatalogProps = {
  initialCategories: Category[]
  initialTotalDocs: number
}

export function CategoryCatalog({ initialCategories, initialTotalDocs }: CategoryCatalogProps) {
  const catalog = useInfiniteCategories({
    initialDocs: initialCategories,
    initialTotalDocs,
  })

  if (catalog.docs.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card py-20 text-center">
        <p className="text-lg text-muted-foreground">No categories available yet.</p>
        <Link
          href="/search"
          className="mt-4 inline-block border-b border-primary pb-0.5 text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
        >
          Browse All Products
        </Link>
      </div>
    )
  }

  return (
    <div id="category-results" className="scroll-mt-24">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {catalog.totalDocs} {catalog.totalDocs === 1 ? 'Category' : 'Categories'}
        </span>
        <Link
          href="/search"
          className="text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
        >
          Browse Products
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 lg:grid-cols-3">
        {catalog.docs.map((category) => {
          const imageUrl = getImageUrl(category.image, 'card')

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary sm:rounded-2xl"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                {imageUrl ? (
                  <SafeImage
                    src={imageUrl}
                    alt={category.title}
                    fill
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 320px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted font-serif text-2xl text-primary sm:text-4xl">
                    {category.title.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              <div className="flex flex-col p-2 sm:p-4">
                <h2 className="line-clamp-2 text-xs font-medium leading-snug text-white sm:text-base">
                  {category.title}
                </h2>
                {category.featured ? (
                  <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.14em] text-primary sm:mt-2 sm:text-[10px] sm:tracking-[0.18em]">
                    Featured
                  </span>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>

      <CatalogLoadMore
        isLoading={catalog.isLoadingMore}
        hasMore={catalog.hasMore}
        label="Loading more categories..."
      />
      <InfiniteScrollSentinel
        enabled={catalog.hasMore && !catalog.isLoadingMore}
        onIntersect={catalog.onIntersect}
      />
    </div>
  )
}
