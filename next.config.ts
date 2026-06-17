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

const remotePatterns = [
  { protocol: 'https', hostname: '**' },
  { protocol: 'http', hostname: 'localhost' },
] as const

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Postgres is external; limit build parallelism for stable static generation.
    cpus: Number(process.env.BUILD_CPUS ?? 1),
    staticGenerationMaxConcurrency: Number(process.env.BUILD_STATIC_CONCURRENCY ?? 1),
    // Tree-shake barrel imports — https://payloadcms.com/docs/performance/overview
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    ...(process.env.NEXT_PUBLIC_IMAGE_CDN_HOST
      ? {
          loader: 'custom' as const,
          loaderFile: './src/lib/imageLoader.ts',
        }
      : {}),
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 96, 128, 256, 384],
    remotePatterns: [...remotePatterns],
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
  serverExternalPackages: ['jose'],

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

export default withPayload(withBundleAnalyzer(nextConfig as import('next').NextConfig), {
  devBundleServerPackages: false,
})
