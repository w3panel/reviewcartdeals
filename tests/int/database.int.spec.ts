import { afterEach, describe, expect, it } from 'vitest'

import {
  getPostgresPoolOptions,
  isPooledNeonUri,
  normalizePostgresUri,
  redactedPostgresTarget,
  resolveMigrationDatabaseUrl,
  resolveRuntimeDatabaseUrl,
} from '@/lib/database'

describe('normalizePostgresUri', () => {
  it('removes channel_binding for serverless compatibility', () => {
    const uri =
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    expect(normalizePostgresUri(uri)).toBe(
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=verify-full',
    )
  })

  it('upgrades sslmode=require to verify-full for remote hosts', () => {
    const uri = 'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=require'
    expect(normalizePostgresUri(uri)).toBe(
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=verify-full',
    )
  })

  it('adds sslmode=verify-full for remote hosts without sslmode', () => {
    const uri = 'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb'
    expect(normalizePostgresUri(uri)).toBe(
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=verify-full',
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

describe('resolveRuntimeDatabaseUrl', () => {
  const keys = [
    'DATABASE_URI',
    'DATABASE_URI_POSTGRES_URL',
    'POSTGRES_URL',
    'DATABASE_URL',
    'DATABASE_URL_DIRECT',
    'POSTGRES_URL_NON_POOLING',
  ] as const

  afterEach(() => {
    for (const key of keys) delete process.env[key]
  })

  it('prefers DATABASE_URI', () => {
    process.env.DATABASE_URI = 'postgresql://runtime/db'
    process.env.POSTGRES_URL = 'postgresql://neon/db'
    expect(resolveRuntimeDatabaseUrl()).toBe('postgresql://runtime/db?sslmode=verify-full')
  })

  it('falls back to POSTGRES_URL from Neon integration', () => {
    process.env.POSTGRES_URL =
      'postgresql://user:pass@ep-foo-pooler.aws.neon.tech/neondb?sslmode=require'
    expect(resolveRuntimeDatabaseUrl()).toContain('ep-foo-pooler')
  })
})

describe('resolveMigrationDatabaseUrl', () => {
  afterEach(() => {
    delete process.env.DATABASE_URL_DIRECT
    delete process.env.POSTGRES_URL_NON_POOLING
    delete process.env.DATABASE_URI
  })

  it('prefers direct URLs for migrations', () => {
    process.env.DATABASE_URL_DIRECT = 'postgresql://direct/db'
    process.env.DATABASE_URI = 'postgresql://pooled/db'
    expect(resolveMigrationDatabaseUrl()).toBe('postgresql://direct/db?sslmode=verify-full')
  })
})

describe('getPostgresPoolOptions', () => {
  it('enables keepAlive and application_name', () => {
    const pool = getPostgresPoolOptions('postgresql://localhost:5432/test')
    expect(pool.keepAlive).toBe(true)
    expect(pool.application_name).toBe('reviewcartdeals-payload')
  })
})

describe('redactedPostgresTarget', () => {
  it('redacts credentials from connection strings', () => {
    expect(
      redactedPostgresTarget('postgresql://user:pass@db.example.com:5432/mydb?sslmode=require'),
    ).toBe('db.example.com:5432/mydb')
  })
})
