import React from 'react'
import { BadgeCheck, Medal, ShieldCheck, Users } from 'lucide-react'

const items = [
  {
    icon: ShieldCheck,
    title: 'Honest Reviews',
    description: 'In-depth reviews by industry experts.',
  },
  {
    icon: BadgeCheck,
    title: 'Verified Products',
    description: 'All products are verified for authenticity.',
  },
  {
    icon: Users,
    title: 'Luxury Community',
    description: 'Join a community of luxury enthusiasts.',
  },
  {
    icon: Medal,
    title: 'Expert Insights',
    description: 'Ratings you can trust before you choose.',
  },
]

export function ValuePropositions() {
  return (
    <section className="mt-6 border-t border-border bg-card md:mt-0 md:py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 md:gap-6 md:px-6 lg:px-8">
        {items.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className={`px-4 py-8 text-center md:px-6 md:text-left ${
              index % 2 === 0 ? 'border-r border-border' : ''
            } ${index < 2 ? 'border-b border-border md:border-b-0' : ''} ${
              index > 0 ? 'md:border-l md:border-border' : ''
            }`}
          >
            <Icon className="mx-auto mb-2 h-5 w-5 text-primary md:mx-0" strokeWidth={1.75} />
            <h3 className="text-xs font-semibold text-primary sm:text-sm">{title}</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-white/80 sm:text-xs">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
