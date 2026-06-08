import { withPayload } from '@payloadcms/next/withPayload'

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
}

export default withPayload(withBundleAnalyzer(nextConfig), { devBundleServerPackages: false })
