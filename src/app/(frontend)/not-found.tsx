import React from 'react'
import Link from 'next/link'

export default function FrontendNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 text-center">
      <h1 className="font-serif text-3xl text-primary sm:text-4xl">Page not found</h1>
      <p className="mt-4 max-w-md text-sm text-muted-foreground">
        The page you requested does not exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground"
        >
          Home
        </Link>
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
