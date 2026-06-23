import Link from 'next/link'
import { SafeImage } from '@/components/SafeImage'
import { getImageUrl } from '@/lib/utils'
import type { Category } from '@/payload-types'

type CategoryCatalogProps = {
  categories: Category[]
}

export function CategoryCatalog({ categories }: CategoryCatalogProps) {
  if (categories.length === 0) {
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
          {categories.length} {categories.length === 1 ? 'Category' : 'Categories'}
        </span>
        <Link
          href="/search"
          className="text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:text-foreground"
        >
          Browse Products
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {categories.map((category) => {
          const imageUrl = getImageUrl(category.image, 'card')

          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                {imageUrl ? (
                  <SafeImage
                    src={imageUrl}
                    alt={category.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 320px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-muted font-serif text-4xl text-primary">
                    {category.title.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </div>

              <div className="flex flex-col p-3 sm:p-4">
                <h2 className="line-clamp-2 text-sm font-medium leading-snug text-white sm:text-base">
                  {category.title}
                </h2>
                {category.featured ? (
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Featured
                  </span>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
