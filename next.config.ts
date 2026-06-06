import { withPayload } from '@payloadcms/next/withPayload'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const vercelOgShim = path.join(dirname, 'src/shims/vercel-og.js')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // D1/SQLite cannot handle concurrent connections during `next build`
    staticGenerationMaxConcurrency: 1,
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

  // Your Next.js config here
  webpack: (webpackConfig: any) => {
    webpackConfig.resolve.alias = {
      ...webpackConfig.resolve.alias,
      'next/dist/compiled/@vercel/og/index.node.js': vercelOgShim,
      'next/dist/compiled/@vercel/og/index.edge.js': vercelOgShim,
    }

    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
