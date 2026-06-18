'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRowLabel } from '@payloadcms/ui/forms/RowLabel/Context'
import { Thumbnail } from '@payloadcms/ui'

import {
  fetchMediaThumbnailUrl,
  fetchVariantOptionValueLabels,
} from '@/lib/fetchPublishedOptionValues'
import { getRelationshipId } from '@/lib/variantOptionValues'

type VisualGalleryRowData = {
  optionValue?: unknown
  gallery?: Array<{ image?: unknown }> | null
}

function resolveInlineMediaUrl(image: unknown): string | null {
  if (typeof image !== 'object' || image === null) return null
  if ('url' in image && typeof image.url === 'string' && image.url) return image.url
  if ('thumbnailURL' in image && typeof image.thumbnailURL === 'string' && image.thumbnailURL) {
    return image.thumbnailURL
  }
  return null
}

export default function VariantVisualGalleryRowLabel() {
  const { data } = useRowLabel<VisualGalleryRowData>()
  const [label, setLabel] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const lastLabelIdRef = useRef<number | null>(null)
  const lastMediaIdRef = useRef<number | null>(null)

  const optionValueId = useMemo(() => getRelationshipId(data?.optionValue), [data?.optionValue])

  const firstImageId = useMemo(
    () => getRelationshipId(data?.gallery?.[0]?.image),
    [data?.gallery?.[0]?.image],
  )

  useEffect(() => {
    if (
      typeof data?.optionValue === 'object' &&
      data.optionValue !== null &&
      'value' in data.optionValue
    ) {
      const value = (data.optionValue as { value?: string }).value?.trim()
      if (value) {
        setLabel(value)
        lastLabelIdRef.current = optionValueId
        return
      }
    }

    if (optionValueId === null) {
      setLabel('')
      lastLabelIdRef.current = null
      return
    }

    if (optionValueId === lastLabelIdRef.current) return

    let cancelled = false
    void fetchVariantOptionValueLabels([optionValueId]).then((labels) => {
      if (!cancelled) {
        setLabel(labels[optionValueId] ?? '')
        lastLabelIdRef.current = optionValueId
      }
    })

    return () => {
      cancelled = true
    }
  }, [data?.optionValue, optionValueId])

  useEffect(() => {
    const firstImage = data?.gallery?.[0]?.image
    const inlineUrl = resolveInlineMediaUrl(firstImage)
    if (inlineUrl) {
      setThumbnailUrl(inlineUrl)
      lastMediaIdRef.current = firstImageId
      return
    }

    if (firstImageId === null) {
      setThumbnailUrl(null)
      lastMediaIdRef.current = null
      return
    }

    if (firstImageId === lastMediaIdRef.current) return

    let cancelled = false
    void fetchMediaThumbnailUrl(firstImageId).then((url) => {
      if (!cancelled) {
        setThumbnailUrl(url)
        lastMediaIdRef.current = firstImageId
      }
    })

    return () => {
      cancelled = true
    }
  }, [data?.gallery, firstImageId])

  return (
    <span className="variant-visual-gallery-row-label">
      {thumbnailUrl ? (
        <Thumbnail
          className="variant-visual-gallery-row-label__thumb"
          fileSrc={thumbnailUrl}
          size="small"
        />
      ) : (
        <span className="variant-visual-gallery-row-label__thumb variant-visual-gallery-row-label__thumb--empty" />
      )}
      <span className="variant-visual-gallery-row-label__text">{label || 'Option'}</span>
    </span>
  )
}
