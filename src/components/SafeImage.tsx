'use client'

import React from 'react'
import Image, { type ImageProps } from 'next/image'
import { FALLBACK_IMAGE_SRC } from '@/lib/imageFallback'

type SafeImageProps = Omit<ImageProps, 'src'> & {
  src?: ImageProps['src'] | null
  fallbackSrc?: ImageProps['src']
}

export function SafeImage({
  src,
  fallbackSrc = FALLBACK_IMAGE_SRC,
  alt,
  onError,
  ...props
}: SafeImageProps) {
  const resolvedSrc = src || fallbackSrc
  const [currentSrc, setCurrentSrc] = React.useState<ImageProps['src']>(resolvedSrc)

  React.useEffect(() => {
    setCurrentSrc(resolvedSrc)
  }, [resolvedSrc])

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={(event) => {
        if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc)
        }
        onError?.(event)
      }}
    />
  )
}
