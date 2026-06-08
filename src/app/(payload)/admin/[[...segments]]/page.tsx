import 'server-only'

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* Modified by vite-plugin-vinext-payload: normalize empty segments for vinext. */
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

// vinext passes segments=[] for /admin; Next.js passes undefined.
// Normalize so Payload's dashboard route resolves correctly.
const normalizeParams = async (params: Args['params']): Promise<{ segments: string[] }> => {
  const resolved = await params
  if (Array.isArray(resolved.segments) && resolved.segments.length === 0) {
    return { ...resolved, segments: undefined as unknown as string[] }
  }
  return resolved
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params: normalizeParams(params), searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, params: normalizeParams(params), searchParams, importMap })

export default Page
