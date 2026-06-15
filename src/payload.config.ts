import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { autoDraftPlugin } from './plugins/autoDraft'
import { autoSlugPlugin } from './plugins/autoSlug'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Brands } from './collections/Brands'
import { Tags } from './collections/Tags'
import { ProductVariants } from './collections/ProductVariants'
import { Products } from './collections/Products'
import { Reviews } from './collections/Reviews'
import { VariantTypes } from './collections/VariantTypes'
import { NavItems } from './collections/NavItems'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) =>
  realpath(value)?.endsWith(path.join('payload', 'bin.js')),
)
const isProduction = process.env.NODE_ENV === 'production'
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
const isLocalWrangler = isCLI || !isProduction || isBuild

const databaseUri = process.env.DATABASE_URI ?? process.env.DATABASE_URL
if (!databaseUri && (isCLI || isProduction)) {
  throw new Error(
    'DATABASE_URI (or DATABASE_URL) is required. Example: postgresql://user:password@localhost:5432/reviewcartdeals',
  )
}

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any // Use PayloadLogger type when it's exported

// Cloudflare context is only required for R2 media storage.
const cloudflare = isLocalWrangler
  ? await getCloudflareContextFromWrangler()
  : await getCloudflareContext({ async: true })

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  graphQL: {
    disable: true,
  },
  collections: [
    Users,
    Media,
    Categories,
    Brands,
    Tags,
    VariantTypes,
    Products,
    ProductVariants,
    Reviews,
    NavItems,
  ],
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri,
    },
    push: false,
  }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    autoSlugPlugin(),
    autoDraftPlugin({ exclude: ['nav-items'] }),
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: false,
      } satisfies GetPlatformProxyOptions),
  )
}
