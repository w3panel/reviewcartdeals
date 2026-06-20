'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SafeImage } from '@/components/SafeImage'

const slides = [
  {
    eyebrow: 'Honest reviews of premium products curated for luxury lovers.',
    title: (
      <>
        Explore. Review. <span className="text-primary">Choose Luxury.</span>
      </>
    ),
    cta: 'Browse Collections',
    href: '/search',
    image: '/seed/hero_luxury_mobile.webp',
  },
  {
    eyebrow: 'Curated watches, leather goods, and designer accessories.',
    title: (
      <>
        Discover. Compare. <span className="text-primary">Enquire Direct.</span>
      </>
    ),
    cta: 'Shop Featured',
    href: '/search',
    image: '/seed/hero_luxury.webp',
  },
  {
    eyebrow: "Expert ratings on the world's finest timepieces and accessories.",
    title: (
      <>
        Read. Trust. <span className="text-primary">Decide Wisely.</span>
      </>
    ),
    cta: 'View Reviews',
    href: '/search',
    image: '/seed/hero_luxury_mobile.webp',
  },
  {
    eyebrow: 'Join a community of luxury enthusiasts who value authenticity.',
    title: (
      <>
        Connect. Share. <span className="text-primary">Live Luxury.</span>
      </>
    ),
    cta: 'Explore Now',
    href: '/search',
    image: '/seed/hero_luxury.webp',
  },
]

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = slides[activeSlide]

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="px-4 pt-4 md:pt-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-border bg-card min-h-[280px] sm:min-h-[300px] md:min-h-[320px] lg:min-h-[380px] md:rounded-3xl">
        <SafeImage
          src={slide.image}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

        <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8 md:max-w-2xl md:p-10">
          <h1 className="font-serif text-[1.75rem] leading-[1.08] text-white sm:text-4xl md:text-5xl lg:text-6xl">
            {slide.title}
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground sm:max-w-md sm:text-base">
            {slide.eyebrow}
          </p>
          <Link
            href={slide.href}
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {slide.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === activeSlide ? 'w-6 bg-primary' : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
