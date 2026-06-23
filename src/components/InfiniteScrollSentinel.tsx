'use client'

import { useCallback, useEffect, useRef } from 'react'

type InfiniteScrollSentinelProps = {
  enabled: boolean
  onIntersect: () => void
  rootMargin?: string
}

export function InfiniteScrollSentinel({
  enabled,
  onIntersect,
  rootMargin = '240px',
}: InfiniteScrollSentinelProps) {
  const onIntersectRef = useRef(onIntersect)
  onIntersectRef.current = onIntersect

  const observerRef = useRef<IntersectionObserver | null>(null)

  const setNode = useCallback(
    (node: HTMLElement | null) => {
      observerRef.current?.disconnect()
      observerRef.current = null

      if (!node || !enabled) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            onIntersectRef.current()
          }
        },
        { rootMargin },
      )

      observerRef.current.observe(node)
    },
    [enabled, rootMargin],
  )

  useEffect(() => {
    return () => observerRef.current?.disconnect()
  }, [])

  if (!enabled) return null

  return <div ref={setNode} className="h-px w-full" aria-hidden="true" />
}
