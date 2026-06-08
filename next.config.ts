import bundleAnalyzer from '@next/bundle-analyzer'
import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const vercelOgShim = path.join(dirname, 'src/shims/vercel-og.js')

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: process.env.CI !== 'true',
})

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
  serverExternalPackages: ['jose', 'pg-cloudflare'],

  turbopack: {
    resolveAlias: {
      'next/dist/compiled/@vercel/og/index.node.js': vercelOgShim,
      'next/dist/compiled/@vercel/og/index.edge.js': vercelOgShim,
    },
  },
}

export default withPayload(withBundleAnalyzer(nextConfig), { devBundleServerPackages: false })
