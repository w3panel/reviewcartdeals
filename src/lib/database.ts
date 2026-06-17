import type { Payload } from 'payload'
import type { Pool } from 'pg'

const LEGACY_STRICT_SSL_MODES = new Set(['prefer', 'require', 'verify-ca'])

/**
 * Normalize a Postgres connection string for node-pg (Neon pooler / Vercel).
 *
 * - Drops `channel_binding=require` (breaks many serverless runtimes)
 * - Upgrades legacy sslmode aliases to `verify-full` (matches pg v8 behavior)
 */
export function normalizePostgresUri(uri: string): string {
  if (!uri) return uri

  try {
    const url = new URL(uri.replace(/^postgresql:/i, 'http:'))
    url.searchParams.delete('channel_binding')

    const isLocal =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === 'postgres'

    const sslmode = url.searchParams.get('sslmode')?.toLowerCase()
    if (!isLocal) {
      if (sslmode && LEGACY_STRICT_SSL_MODES.has(sslmode)) {
        url.searchParams.set('sslmode', 'verify-full')
      } else if (!sslmode) {
        url.searchParams.set('sslmode', 'verify-full')
      }
    }

    return url.href.replace(/^http:/i, 'postgresql:')
  } catch {
    return uri
  }
}

export function isPooledNeonUri(uri: string): boolean {
  try {
    return new URL(uri).hostname.includes('-pooler.')
  } catch {
    return false
  }
}

function firstEnv(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim()
    if (value) return value
  }
  return ''
}

/** Runtime pooled URL for serverless / app traffic. */
export function resolveRuntimeDatabaseUrl(): string {
  return normalizePostgresUri(
    firstEnv('DATABASE_URI', 'DATABASE_URI_POSTGRES_URL', 'POSTGRES_URL', 'DATABASE_URL'),
  )
}

/** Direct URL for Payload CLI migrations (non-pooler). */
export function resolveMigrationDatabaseUrl(): string {
  return normalizePostgresUri(
    firstEnv(
      'DATABASE_URL_DIRECT',
      'POSTGRES_URL_NON_POOLING',
      'DATABASE_URI',
      'DATABASE_URI_POSTGRES_URL',
      'POSTGRES_URL',
      'DATABASE_URL',
    ),
  )
}

/** Redacted target for logs (no password). */
export function redactedPostgresTarget(uri = resolveRuntimeDatabaseUrl()): string {
  if (!uri) return '(database URL unset)'
  try {
    const u = new URL(uri.replace(/^postgresql:/i, 'http:'))
    const db = u.pathname.replace(/^\//, '') || '?'
    return `${u.hostname}:${u.port || '5432'}/${db}`
  } catch {
    return '(could not parse connection string)'
  }
}

const isVercel = process.env.VERCEL === '1'
const pgPoolDefaultMax = isVercel ? 3 : 15
const pgPoolMax = Number.parseInt(
  process.env.PG_POOL_MAX ?? process.env.DATABASE_POOL_MAX ?? String(pgPoolDefaultMax),
  10,
)
const pgPoolMaxSafe = Number.isFinite(pgPoolMax) && pgPoolMax > 0 ? pgPoolMax : pgPoolDefaultMax
const pgPoolIdleTimeoutMs = Number.parseInt(
  process.env.PG_POOL_IDLE_TIMEOUT_MS ?? (isVercel ? '5000' : '120000'),
  10,
)
const pgPoolConnectionTimeoutMs = Number.parseInt(
  process.env.PG_POOL_CONNECTION_TIMEOUT_MS ??
    process.env.DATABASE_CONNECT_TIMEOUT_MS ??
    (isVercel ? '20000' : '60000'),
  10,
)
const pgStatementTimeoutMs = Number.parseInt(
  process.env.PG_STATEMENT_TIMEOUT_MS || (isVercel ? '25000' : '0'),
  10,
)
const pgIdleInTxnTimeoutMs = Number.parseInt(
  process.env.PG_IDLE_IN_TRANSACTION_TIMEOUT_MS || (isVercel ? '10000' : '0'),
  10,
)

export function getPostgresPoolOptions(
  connectionString: string,
  options?: { max?: number; isServerlessRuntime?: boolean },
): {
  connectionString: string
  max: number
  idleTimeoutMillis: number
  connectionTimeoutMillis: number
  keepAlive: boolean
  keepAliveInitialDelayMillis: number
  application_name: string
  statement_timeout?: number
  idle_in_transaction_session_timeout?: number
  allowExitOnIdle?: boolean
} {
  const max = options?.max ?? pgPoolMaxSafe
  const statementTimeout =
    Number.isFinite(pgStatementTimeoutMs) && pgStatementTimeoutMs > 0
      ? pgStatementTimeoutMs
      : undefined
  const idleInTxnTimeout =
    Number.isFinite(pgIdleInTxnTimeoutMs) && pgIdleInTxnTimeoutMs > 0
      ? pgIdleInTxnTimeoutMs
      : undefined

  return {
    connectionString: normalizePostgresUri(connectionString),
    max,
    idleTimeoutMillis: Number.isFinite(pgPoolIdleTimeoutMs) ? pgPoolIdleTimeoutMs : 5000,
    connectionTimeoutMillis: Number.isFinite(pgPoolConnectionTimeoutMs)
      ? pgPoolConnectionTimeoutMs
      : 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10_000,
    application_name: 'reviewcartdeals-payload',
    ...(statementTimeout !== undefined ? { statement_timeout: statementTimeout } : {}),
    ...(idleInTxnTimeout !== undefined
      ? { idle_in_transaction_session_timeout: idleInTxnTimeout }
      : {}),
    ...(options?.isServerlessRuntime ? { allowExitOnIdle: true } : {}),
  }
}

const instrumented = Symbol('reviewcartdeals_pg_pool_instrumented')

type PoolWithFlag = Pool & { [instrumented]?: boolean }

/** Log pool-level connection errors (broken idle clients, server disconnects). */
export function instrumentPayloadPostgresPool(payload: Payload): void {
  const db = payload.db as { pool?: Pool } | undefined
  const pool = db?.pool as PoolWithFlag | undefined
  if (!pool || pool[instrumented]) return
  pool[instrumented] = true

  pool.on('error', (err) => {
    payload.logger.error({
      err,
      msg: '[pg-pool] pool "error" event (often broken idle client or server closed connection)',
      target: redactedPostgresTarget(),
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    })
  })
}
