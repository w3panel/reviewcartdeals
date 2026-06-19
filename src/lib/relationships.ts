/** Extract an ID from a Payload relationship field value (populated doc or raw ID). */
export function getRelationshipId(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  if (typeof value === 'object' && value !== null && 'id' in value) {
    const id = (value as { id: unknown }).id
    if (typeof id === 'number' && Number.isFinite(id)) return id
    if (typeof id === 'string') {
      const parsed = Number(id)
      return Number.isFinite(parsed) ? parsed : null
    }
  }
  return null
}

export function emptyRelationshipFilter() {
  return { id: { in: [] as number[] } }
}
