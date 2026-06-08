// import path from 'path'
import { withPayload } from '@payloadcms/next/withPayload'
// import { fileURLToPath } from 'url'

// const dirname = path.dirname(fileURLToPath(import.meta.url))
// const vercelOgShim = path.join(dirname, 'src/shims/vercel-og.js')

// const dateFnsLocalePaths = [
//   'ar',
//   'az',
//   'bg',
//   'bn',
//   'ca',
//   'cs',
//   'da',
//   'de',
//   'es',
//   'et',
//   'fa-IR',
//   'fr',
//   'he',
//   'hr',
//   'hu',
//   'id',
//   'is',
//   'it',
//   'ja',
//   'ko',
//   'lt',
//   'lv',
//   'nb',
//   'nl',
//   'pl',
//   'pt',
//   'ro',
//   'ru',
//   'sk',
//   'sl',
//   'sr',
//   'sr-Latn',
//   'sv',
//   'ta',
//   'th',
//   'tr',
//   'uk',
//   'vi',
//   'zh-CN',
//   'zh-TW',
// ]

// const dateFnsLocaleAliases = Object.fromEntries(
//   dateFnsLocalePaths.map((locale) => [`date-fns/locale/${locale}`, 'date-fns/locale/en-US']),
// )

const withBundleAnalyzer = (config: typeof nextConfig) => config

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // D1/SQLite cannot handle concurrent workerd instances during `next build`
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    // Tree-shake barrel imports — https://payloadcms.com/docs/performance/overview
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    unoptimized: true,
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/seed/**',
      },
      {
        pathname: '/placeholder.webp',
      },
    ],
  },
  // Packages with Cloudflare Workers (workerd) specific code
  // Read more: https://opennext.js.org/cloudflare/howtos/workerd
  serverExternalPackages: [
    'jose',
    'pg-cloudflare',
    '@payloadcms/db-d1-sqlite',
    'drizzle-kit',
    'sharp',
    'pino-pretty',
  ],

  outputFileTracingExcludes: {
    '**/*': [
      '**/node_modules/drizzle-kit/**',
      '**/node_modules/sharp/**',
      '**/node_modules/@img/**',
      '**/node_modules/wrangler/**',
      '**/node_modules/pino-pretty/**',
      '**/node_modules/next/dist/compiled/@vercel/og/**',
    ],
  },

  turbopack: {
    resolveAlias: {
      // ...dateFnsLocaleAliases,
      // 'next/dist/compiled/@vercel/og/index.node.js': vercelOgShim,
      // 'next/dist/compiled/@vercel/og/index.edge.js': vercelOgShim,
    },
  },
}

export default withPayload(withBundleAnalyzer(nextConfig), { devBundleServerPackages: false })
