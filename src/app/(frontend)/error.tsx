'use client'

import React from 'react'
import Link from 'next/link'

export default function FrontendError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="font-serif text-3xl text-primary sm:text-4xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        We could not load this page. Please try again or return to the catalog.
      </p>
      {process.env.NODE_ENV === 'development' && error.message ? (
        <p className="mt-4 max-w-lg text-xs text-red-400">{error.message}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground"
        >
          Try again
        </button>
        <Link
          href="/search"
          className="rounded-full border border-border px-6 py-3 text-sm font-bold uppercase tracking-wide text-foreground"
        >
          Browse catalog
        </Link>
      </div>
    </div>
  )
}
