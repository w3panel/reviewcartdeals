'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

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
  },
]

export function HomeHero() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = slides[activeSlide]

  return (
    <section className="px-4 pt-4 md:pt-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl md:rounded-3xl border border-border bg-card min-h-[220px] sm:min-h-[260px] md:min-h-[320px] lg:min-h-[380px]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(212,175,55,0.18),transparent_55%),radial-gradient(ellipse_at_20%_80%,rgba(212,175,55,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end p-6 sm:p-8 md:p-10 lg:max-w-2xl">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.05] text-white">
            {slide.title}
          </h1>
          <p className="mt-3 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
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
