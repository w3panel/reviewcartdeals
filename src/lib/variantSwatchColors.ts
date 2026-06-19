const COLOR_LABEL_MAP: Record<string, string> = {
  'navy blue': '#1e3a5f',
  navy: '#1e3a5f',
  'dark green': '#1b4332',
  green: '#2d6a4f',
  black: '#111111',
  white: '#f5f5f5',
  gold: '#d4af37',
  silver: '#c0c0c0',
  red: '#b91c1c',
  blue: '#2563eb',
  brown: '#78350f',
  beige: '#d6c4a8',
  pink: '#db2777',
  yellow: '#eab308',
  orange: '#ea580c',
  purple: '#7c3aed',
  grey: '#6b7280',
  gray: '#6b7280',
}

export function getVariantSwatchColor(label: string): string | null {
  const normalized = label.trim().toLowerCase()
  if (COLOR_LABEL_MAP[normalized]) return COLOR_LABEL_MAP[normalized]

  for (const [name, color] of Object.entries(COLOR_LABEL_MAP)) {
    if (normalized.includes(name)) return color
  }

  return null
}
