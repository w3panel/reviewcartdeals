/**
 * Normalize a Postgres connection string for node-pg (Neon pooler / Vercel).
 *
 * - Drops `channel_binding=require` (breaks many serverless runtimes)
 * - Ensures `sslmode=require` when connecting to remote hosts
 */
export function normalizePostgresUri(uri: string): string {
  try {
    const url = new URL(uri)
    url.searchParams.delete('channel_binding')

    const isLocal =
      url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === 'postgres'

    if (!isLocal && !url.searchParams.has('sslmode')) {
      url.searchParams.set('sslmode', 'require')
    }

    return url.toString()
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
