'use client'

import React, { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { SafeImage } from '@/components/SafeImage'
import type { Brand, Product } from '@/payload-types'
import { getImageUrl, getProductMainImage } from '@/lib/utils'

type HeaderSearchVariant = 'desktop' | 'mobile'

type CatalogResponse = {
  docs: Product[]
  totalDocs: number
}

type HeaderSearchProps = {
  variant?: HeaderSearchVariant
  className?: string
}

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 300
const RESULT_LIMIT = 6

export function HeaderSearch({ variant = 'desktop', className = '' }: HeaderSearchProps) {
  const router = useRouter()
  const listboxId = useId()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Product[]>([])
  const [totalDocs, setTotalDocs] = useState(0)

  const trimmedQuery = query.trim()
  const showDropdown = open && trimmedQuery.length > 0

  const navigateToSearchPage = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery ?? trimmedQuery).trim()
      router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search')
      setOpen(false)
      inputRef.current?.blur()
    },
    [router, trimmedQuery],
  )

  const navigateToProduct = useCallback(
    (slug: string) => {
      router.push(`/product/${slug}`)
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    },
    [router],
  )

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown, { passive: true })
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([])
      setTotalDocs(0)
      setLoading(false)
      return
    }

    setLoading(true)

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams({
        q: trimmedQuery,
        limit: String(RESULT_LIMIT),
        page: '1',
      })

      fetch(`/api/products/catalog?${params.toString()}`)
        .then((response) => response.json() as Promise<CatalogResponse>)
        .then((data) => {
          setResults(data.docs ?? [])
          setTotalDocs(data.totalDocs ?? 0)
        })
        .catch(() => {
          setResults([])
          setTotalDocs(0)
        })
        .finally(() => setLoading(false))
    }, DEBOUNCE_MS)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [trimmedQuery])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      inputRef.current?.blur()
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      navigateToSearchPage()
    }
  }

  const isDesktop = variant === 'desktop'

  return (
    <div ref={containerRef} className={`relative ${className}`.trim()}>
      <div
        className={
          isDesktop
            ? 'flex min-w-[280px] items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 transition-colors focus-within:border-primary/40'
            : 'flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors focus-within:border-primary/40'
        }
      >
        <Search className="h-4 w-4 flex-shrink-0 text-primary" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search watches, wallets, bags..."
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? listboxId : undefined}
          aria-autocomplete="list"
          role="combobox"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      {showDropdown ? (
        <div
          className={`absolute left-0 right-0 z-[60] mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl ${
            isDesktop ? 'min-w-[320px]' : ''
          }`}
        >
          {trimmedQuery.length < MIN_QUERY_LENGTH ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Type at least {MIN_QUERY_LENGTH} characters to search
            </p>
          ) : loading ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No products found for &ldquo;{trimmedQuery}&rdquo;
            </p>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Search suggestions">
              {results.map((product) => {
                const imageUrl = getImageUrl(getProductMainImage(product), 'thumbnail')
                const brandTitle =
                  typeof product.brand === 'object' && product.brand !== null
                    ? (product.brand as Brand).title
                    : String(product.brand ?? '')

                return (
                  <li key={product.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => navigateToProduct(product.slug)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-black">
                        <SafeImage
                          src={imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        {brandTitle ? (
                          <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                            {brandTitle}
                          </p>
                        ) : null}
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
                          {product.title}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {trimmedQuery.length >= MIN_QUERY_LENGTH && !loading ? (
            <div className="border-t border-border">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => navigateToSearchPage()}
                className="w-full px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-primary transition-colors hover:bg-surface"
              >
                {totalDocs > results.length ? `View all ${totalDocs} results` : 'View all results'}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
