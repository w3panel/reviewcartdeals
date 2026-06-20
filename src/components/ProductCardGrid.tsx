import React from 'react'

type ProductCardGridProps = {
  children: React.ReactNode
  className?: string
}

export function ProductCardGrid({ children, className = '' }: ProductCardGridProps) {
  return (
    <div className={`grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 ${className}`}>
      {children}
    </div>
  )
}
