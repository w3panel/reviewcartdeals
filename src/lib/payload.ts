import { getPayload, type Payload } from 'payload'
import configPromise from '@payload-config'

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
    cache.promise = getPayload({ config: configPromise })
  }

  cache.client = await cache.promise
  return cache.client
}
