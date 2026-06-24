'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CatalogVariantGroupFilter } from '@/lib/catalogFilterTypes'
import { getVariantSwatchColor } from '@/lib/variantSwatchColors'

const VARIANT_VISIBLE_COUNT_MOBILE = 6
const VARIANT_VISIBLE_COUNT_DESKTOP = 4
const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)'

function useVariantVisibleCount() {
  const [visibleCount, setVisibleCount] = useState(VARIANT_VISIBLE_COUNT_MOBILE)

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY)

    const updateVisibleCount = () => {
      setVisibleCount(
        mediaQuery.matches ? VARIANT_VISIBLE_COUNT_DESKTOP : VARIANT_VISIBLE_COUNT_MOBILE,
      )
    }

    updateVisibleCount()
    mediaQuery.addEventListener('change', updateVisibleCount)

    return () => mediaQuery.removeEventListener('change', updateVisibleCount)
  }, [])

  return visibleCount
}

type FilterVariantGroupFieldProps = {
  group: CatalogVariantGroupFilter
  selectedValueIds: number[]
  onToggleValue: (valueId: number) => void
}

function VariantOptionsScrollRow({
  itemCount,
  visibleCount,
  gapClassName,
  gapRem,
  children,
}: {
  itemCount: number
  visibleCount: number
  gapClassName: string
  gapRem: number
  children: React.ReactNode
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const gapTotalRem = (itemCount - 1) * gapRem
  const itemFlex = `0 0 calc((100% - ${gapTotalRem}rem) / ${itemCount})`

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    const maxScrollLeft = element.scrollWidth - element.clientWidth
    setCanScrollLeft(element.scrollLeft > 2)
    setCanScrollRight(element.scrollLeft < maxScrollLeft - 2)
  }, [])

  useEffect(() => {
    updateScrollState()

    const element = scrollRef.current
    if (!element) return

    element.addEventListener('scroll', updateScrollState, { passive: true })
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(element)

    return () => {
      element.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [itemCount, updateScrollState, visibleCount])

  const scroll = (direction: 'left' | 'right') => {
    const element = scrollRef.current
    if (!element) return

    const track = element.firstElementChild as HTMLElement | null
    const firstItem = track?.firstElementChild as HTMLElement | null
    const gapPx = track
      ? Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0
      : 0
    const itemStep = firstItem ? firstItem.offsetWidth + gapPx : element.clientWidth / visibleCount
    const scrollDistance = itemStep * Math.min(visibleCount - 1, 3)

    element.scrollBy({
      left: direction === 'left' ? -scrollDistance : scrollDistance,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative">
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 z-10 flex h-full w-9 items-center justify-start bg-gradient-to-r from-background via-background/95 to-transparent pl-0.5 text-primary transition-opacity hover:opacity-80"
          aria-label="Scroll variant options left"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className="w-full overflow-x-auto no-scrollbar touch-pan-x overscroll-x-contain"
      >
        <div
          className={`flex flex-nowrap ${gapClassName}`}
          style={{
            width: `${(itemCount / visibleCount) * 100}%`,
            minWidth: '100%',
          }}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement<{ style?: React.CSSProperties }>(child)) return child
            return React.cloneElement(child, {
              style: { ...child.props.style, flex: itemFlex },
            })
          })}
        </div>
      </div>

      {canScrollRight ? (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 z-10 flex h-full w-9 items-center justify-end bg-gradient-to-l from-background via-background/95 to-transparent pr-0.5 text-primary transition-opacity hover:opacity-80"
          aria-label="Scroll variant options right"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      ) : null}
    </div>
  )
}

export function FilterVariantGroupField({
  group,
  selectedValueIds,
  onToggleValue,
}: FilterVariantGroupFieldProps) {
  const visibleCount = useVariantVisibleCount()
  const useScrollLayout = group.values.length > visibleCount

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {group.label}
      </p>

      {group.isVisual
        ? (() => {
            const swatchButtons = group.values.map((value) => {
              const isSelected = selectedValueIds.includes(value.id)
              const swatchColor = getVariantSwatchColor(value.label)

              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() => onToggleValue(value.id)}
                  aria-pressed={isSelected}
                  aria-label={value.label}
                  title={value.label}
                  className={`flex min-w-0 flex-shrink-0 flex-col items-center gap-1.5 transition-transform ${
                    isSelected ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <span
                    className={`h-9 w-9 rounded-full border-2 ${
                      isSelected
                        ? 'border-primary shadow-[0_0_0_2px_rgba(212,175,55,0.25)]'
                        : 'border-border'
                    }`}
                    style={{
                      backgroundColor: swatchColor ?? '#2a2a2a',
                    }}
                  />
                  <span
                    className={`w-full truncate text-center text-[10px] ${
                      isSelected ? 'font-medium text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {value.label}
                  </span>
                </button>
              )
            })

            if (useScrollLayout) {
              return (
                <VariantOptionsScrollRow
                  itemCount={group.values.length}
                  visibleCount={visibleCount}
                  gapClassName="gap-3"
                  gapRem={0.75}
                >
                  {swatchButtons}
                </VariantOptionsScrollRow>
              )
            }

            return <div className="flex flex-wrap gap-3">{swatchButtons}</div>
          })()
        : (() => {
            const chipButtons = group.values.map((value) => {
              const isSelected = selectedValueIds.includes(value.id)

              return (
                <button
                  key={value.id}
                  type="button"
                  onClick={() => onToggleValue(value.id)}
                  aria-pressed={isSelected}
                  className={`flex-shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-white'
                  }`}
                >
                  {value.label}
                </button>
              )
            })

            if (useScrollLayout) {
              return (
                <VariantOptionsScrollRow
                  itemCount={group.values.length}
                  visibleCount={visibleCount}
                  gapClassName="gap-2"
                  gapRem={0.5}
                >
                  {chipButtons}
                </VariantOptionsScrollRow>
              )
            }

            return <div className="flex flex-wrap gap-2">{chipButtons}</div>
          })()}
    </div>
  )
}
