'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

type FilterSheetContextValue = {
  isOpen: boolean
  openFilter: () => void
  closeFilter: () => void
}

const FilterSheetContext = createContext<FilterSheetContextValue | null>(null)

export function FilterSheetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openFilter = useCallback(() => setIsOpen(true), [])
  const closeFilter = useCallback(() => setIsOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, openFilter, closeFilter }),
    [isOpen, openFilter, closeFilter],
  )

  return <FilterSheetContext.Provider value={value}>{children}</FilterSheetContext.Provider>
}

export function useFilterSheet() {
  const context = useContext(FilterSheetContext)
  if (!context) {
    throw new Error('useFilterSheet must be used within FilterSheetProvider')
  }
  return context
}
