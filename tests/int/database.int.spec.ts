import { describe, expect, it } from 'vitest'

import { isPooledNeonUri, normalizePostgresUri } from '@/lib/database'

describe('normalizePostgresUri', () => {
  it('removes channel_binding for serverless compatibility', () => {
    const uri =
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    expect(normalizePostgresUri(uri)).toBe(
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=require',
    )
  })

  it('adds sslmode=require for remote hosts', () => {
    const uri = 'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb'
    expect(normalizePostgresUri(uri)).toBe(
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=require',
    )
  })

  it('leaves local connections unchanged', () => {
    const uri = 'postgresql://reviewcartdeals:reviewcartdeals@localhost:5432/reviewcartdeals'
    expect(normalizePostgresUri(uri)).toBe(uri)
  })
})

describe('isPooledNeonUri', () => {
  it('detects Neon pooler hostnames', () => {
    expect(isPooledNeonUri('postgresql://u:p@ep-x-pooler.aws.neon.tech/db')).toBe(true)
    expect(isPooledNeonUri('postgresql://u:p@ep-x.aws.neon.tech/db')).toBe(false)
  })
})
