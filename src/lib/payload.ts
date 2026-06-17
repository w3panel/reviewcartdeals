import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'

/** Cached Payload instance — see https://payloadcms.com/docs/performance/overview */

type PayloadCache = {
  client: Payload | null
  promise: Promise<Payload> | null
}

const globalForPayload = globalThis as typeof globalThis & {
  payload?: PayloadCache
}

const cache = globalForPayload.payload ?? { client: null, promise: null }
globalForPayload.payload = cache

export async function getPayloadClient(): Promise<Payload> {
  if (cache.client) {
    return cache.client
  }

  if (!cache.promise) {
    cache.promise = getPayload({ config: configPromise }).then(async (payload) => {
      if (process.env.VERCEL === '1' && payload.db.pool) {
        const { attachDatabasePool } = await import('@vercel/functions')
        attachDatabasePool(payload.db.pool)
      }
      return payload
    })
  }

  cache.client = await cache.promise
  return cache.client
}
