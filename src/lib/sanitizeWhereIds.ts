import type { Where } from 'payload'

function isEmptyId(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.filter((entry) => !isEmptyId(entry))
  }

  if (typeof value === 'object' && value !== null) {
    return sanitizeWhereIds(value as Where)
  }

  return value
}

/**
 * Removes empty id values from `in` / `not_in` filters so Postgres integer
 * columns are not queried with "".
 */
export function sanitizeWhereIds(where: Where | undefined): Where | undefined {
  if (!where) return where

  const sanitized: Where = {}

  for (const [key, rawValue] of Object.entries(where)) {
    if (key === 'and' || key === 'or') {
      const clauses = Array.isArray(rawValue) ? rawValue : [rawValue]
      const nextClauses = clauses
        .map((clause) => sanitizeWhereIds(clause as Where))
        .filter((clause): clause is Where => clause !== undefined && Object.keys(clause).length > 0)

      if (nextClauses.length > 0) {
        sanitized[key] = nextClauses
      }
      continue
    }

    if (typeof rawValue === 'object' && rawValue !== null && !Array.isArray(rawValue)) {
      const operators: Record<string, unknown> = {}
      for (const [operator, operatorValue] of Object.entries(rawValue)) {
        if (operator === 'in' || operator === 'not_in') {
          const cleaned = sanitizeValue(operatorValue)
          if (Array.isArray(cleaned) && cleaned.length > 0) {
            operators[operator] = cleaned
          }
          continue
        }

        operators[operator] = sanitizeValue(operatorValue)
      }

      if (Object.keys(operators).length > 0) {
        sanitized[key] = operators
      }
      continue
    }

    sanitized[key] = rawValue
  }

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}
