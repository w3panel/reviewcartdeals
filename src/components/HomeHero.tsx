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
        Explore. Review. <span className="text-accent">Choose Luxury.</span>
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
        Discover. Compare. <span className="text-accent">Enquire Direct.</span>
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
        Read. Trust. <span className="text-accent">Decide Wisely.</span>
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
        Connect. Share. <span className="text-accent">Live Luxury.</span>
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
      <div className="relative mx-auto flex min-h-[300px] max-w-7xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_4px_24px_rgba(45,36,30,0.08)] sm:min-h-[320px] md:min-h-[340px] md:rounded-3xl lg:min-h-[380px]">
        <div className="relative z-10 flex w-[48%] min-w-[48%] flex-col justify-center bg-gradient-to-br from-card via-muted to-surface p-5 sm:w-[46%] sm:min-w-[46%] sm:p-7 md:p-9 lg:w-[44%] lg:min-w-[44%]">
          <h1 className="font-serif text-[1.35rem] leading-[1.12] text-foreground sm:text-[1.75rem] md:text-4xl lg:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-2.5 max-w-[14rem] text-[11px] leading-relaxed text-muted-foreground sm:mt-3 sm:max-w-xs sm:text-sm md:max-w-sm md:text-base">
            {slide.eyebrow}
          </p>
          <Link
            href={slide.href}
            className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[11px] font-bold text-primary-foreground transition-colors hover:bg-primary-hover sm:mt-5 sm:px-5 sm:py-3 sm:text-sm"
          >
            {slide.cta}
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Link>
        </div>

        <div className="relative min-h-[300px] flex-1 sm:min-h-0">
          <SafeImage
            src={slide.image}
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 55vw, 60vw"
            className="object-cover object-center"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent sm:w-10" />
        </div>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Show slide ${index + 1}`}
              onClick={() => setActiveSlide(index)}
              className={`h-1.5 rounded-full transition-all sm:h-2 ${
                index === activeSlide
                  ? 'w-5 bg-primary sm:w-6'
                  : 'w-1.5 bg-muted-foreground/35 sm:w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
