import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import {
  getPostgresPoolOptions,
  instrumentPayloadPostgresPool,
  resolveMigrationDatabaseUrl,
  resolveRuntimeDatabaseUrl,
} from './lib/database'
import { autoDraftPlugin } from './plugins/autoDraft'
import { autoSlugPlugin } from './plugins/autoSlug'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Categories } from './collections/Categories'
import { Brands } from './collections/Brands'
import { Tags } from './collections/Tags'
import { VariantGroups } from './collections/VariantGroups'
import { VariantValues } from './collections/VariantValues'
import { Products } from './collections/Products'
import { ProductVariants } from './collections/ProductVariants'
import { Reviews } from './collections/Reviews'
import { NavItems } from './collections/NavItems'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => {
  const resolved = realpath(value)
  return (
    resolved?.endsWith(path.join('payload', 'bin.js')) ||
    resolved?.includes(`${path.sep}src${path.sep}scripts${path.sep}`)
  )
})
const isProduction = process.env.NODE_ENV === 'production'
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const databaseUri = resolveRuntimeDatabaseUrl()
const migrationDatabaseUri = resolveMigrationDatabaseUrl()
const isServerlessRuntime = isProduction && !isCLI && !isBuildPhase
const databasePoolMax = isCLI || isBuildPhase ? 10 : undefined

if (!databaseUri && (isCLI || isProduction || isBuildPhase)) {
  throw new Error(
    'DATABASE_URI (or DATABASE_URI_POSTGRES_URL / POSTGRES_URL / DATABASE_URL) is required. Example: postgresql://user:password@localhost:5432/reviewcartdeals',
  )
}

const r2Bucket = process.env.R2_BUCKET
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const r2Endpoint = process.env.R2_ENDPOINT

const r2StorageEnabled = Boolean(r2Bucket && r2AccessKeyId && r2SecretAccessKey && r2Endpoint)

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const productionLogger = {
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

export default buildConfig({
  sharp,
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
    VariantGroups,
    VariantValues,
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
    pool: getPostgresPoolOptions(isCLI || isBuildPhase ? migrationDatabaseUri : databaseUri, {
      max: databasePoolMax,
      isServerlessRuntime,
    }),
    push: false,
  }),
  onInit: async (payload) => {
    instrumentPayloadPostgresPool(payload)
  },
  logger: isProduction ? productionLogger : undefined,
  plugins: [
    autoSlugPlugin(),
    autoDraftPlugin({ exclude: ['nav-items'] }),
    s3Storage({
      enabled: r2StorageEnabled,
      bucket: r2Bucket ?? '',
      collections: { media: true },
      config: {
        credentials: {
          accessKeyId: r2AccessKeyId ?? '',
          secretAccessKey: r2SecretAccessKey ?? '',
        },
        region: 'auto',
        endpoint: r2Endpoint ?? '',
        forcePathStyle: true,
      },
    }),
  ],
})
