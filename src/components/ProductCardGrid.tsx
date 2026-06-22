import React from 'react'

type ProductCardGridProps = {
  children: React.ReactNode
  className?: string
}

export function ProductCardGrid({ children, className = '' }: ProductCardGridProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-6 ${className}`}
    >
      {children}
    </div>
  )
}
