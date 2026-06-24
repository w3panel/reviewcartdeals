'use client'

import React from 'react'
import Link from 'next/link'
import { SafeImage } from '@/components/SafeImage'
import { getImageUrl } from '@/lib/utils'
import type { Category } from '@/payload-types'

const HOME_MOBILE_CATEGORY_LIMIT = 5
const HOME_DESKTOP_CATEGORY_LIMIT = 10

type CategoryScrollerProps = {
  categories: Category[]
  selectedCategory?: string | null
  onSelectCategory?: (slug: string | null) => void
  showViewAll?: boolean
}

export function CategoryScroller({
  categories,
  selectedCategory = null,
  onSelectCategory,
  showViewAll = true,
}: CategoryScrollerProps) {
  const mobileCategories = categories.slice(0, HOME_MOBILE_CATEGORY_LIMIT)
  const desktopCategories = categories.slice(0, HOME_DESKTOP_CATEGORY_LIMIT)

  const renderCategory = (category: Category) => {
    const isSelected = selectedCategory === category.slug
    const content = (
      <>
        <div
          className={`relative h-[88px] w-[88px] flex-shrink-0 overflow-hidden rounded-2xl border bg-surface sm:h-24 sm:w-24 ${
            isSelected ? 'border-primary ring-1 ring-primary' : 'border-border'
          }`}
        >
          {category.image ? (
            <SafeImage
              src={getImageUrl(category.image, 'thumbnail')}
              alt={category.title}
              fill
              className="object-cover opacity-90"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-2xl font-serif text-primary">
              {category.title.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
        <span className="mt-2 block max-w-[88px] truncate text-center text-xs font-medium text-white sm:max-w-24">
          {category.title}
        </span>
      </>
    )

    if (onSelectCategory) {
      return (
        <button
          key={category.id}
          type="button"
          onClick={() =>
            onSelectCategory(selectedCategory === category.slug ? null : category.slug!)
          }
          className="flex flex-shrink-0 flex-col items-center"
        >
          {content}
        </button>
      )
    }

    return (
      <Link
        key={category.id}
        href={`/category/${category.slug}`}
        className="flex flex-shrink-0 flex-col items-center"
      >
        {content}
      </Link>
    )
  }

  return (
    <section className="px-4 pt-8 md:pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl sm:text-2xl text-white">Categories</h2>
          {showViewAll && (
            <Link href="/category" className="text-sm text-primary underline underline-offset-4">
              View all
            </Link>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar sm:gap-4 lg:hidden">
          {mobileCategories.map((category) => renderCategory(category))}
        </div>

        <div className="hidden gap-4 lg:grid lg:grid-cols-5 lg:justify-items-center xl:grid-cols-10">
          {desktopCategories.map((category) => renderCategory(category))}
        </div>
      </div>
    </section>
  )
}
