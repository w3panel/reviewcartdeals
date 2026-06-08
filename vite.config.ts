import { cloudflare } from '@cloudflare/vite-plugin'
import vinext from 'vinext'
import { defineConfig } from 'vite'
import { payloadPlugin } from 'vite-plugin-vinext-payload'
import { payloadDevClientStubs, payloadWorkerdShims } from './src/shims/payload-shims'

export default defineConfig(({ command }) => ({
  plugins: [
    ...(command === 'build'
      ? [
          cloudflare({
            viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
          }),
        ]
      : []),
    payloadDevClientStubs(),
    payloadWorkerdShims(),
    vinext(),
    payloadPlugin(),
  ],
}))
