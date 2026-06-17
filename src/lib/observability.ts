const SLOW_QUERY_MS = Number(process.env.SLOW_QUERY_MS ?? 500)

export async function withQueryTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  const start = performance.now()
  try {
    return await fn()
  } finally {
    const durationMs = performance.now() - start
    if (durationMs >= SLOW_QUERY_MS) {
      console.warn(
        JSON.stringify({
          level: 'warn',
          msg: 'slow_query',
          label,
          durationMs: Math.round(durationMs),
        }),
      )
    }
  }
}
