import { cloudflare } from '@cloudflare/vite-plugin'
import path from 'path'
import type { Plugin } from 'vite'
import { fileURLToPath } from 'url'
import vinext from 'vinext'
import { defineConfig } from 'vite'
import { payloadPlugin } from 'vite-plugin-vinext-payload'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const vercelOgShim = path.join(dirname, 'src/shims/vercel-og.js')
const dateFnsLocaleShim = path.join(dirname, 'src/shims/date-fns-locale-en-us.js')
const fileTypeShim = path.join(dirname, 'src/shims/file-type.js')
const pinoShim = path.join(dirname, 'src/shims/pino.js')
const undiciShim = path.join(dirname, 'src/shims/undici.js')
const promptsShim = path.join(dirname, 'src/shims/prompts.js')

const payloadResolveAliases = {
  'file-type': fileTypeShim,
  pino: pinoShim,
  undici: undiciShim,
  prompts: promptsShim,
}

const dateFnsLocalePaths = [
  'ar',
  'az',
  'bg',
  'bn',
  'ca',
  'cs',
  'da',
  'de',
  'es',
  'et',
  'fa-IR',
  'fr',
  'he',
  'hr',
  'hu',
  'id',
  'is',
  'it',
  'ja',
  'ko',
  'lt',
  'lv',
  'nb',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sr',
  'sr-Latn',
  'sv',
  'ta',
  'th',
  'tr',
  'uk',
  'vi',
  'zh-CN',
  'zh-TW',
  'en-US',
]

const dateFnsLocaleAliases = Object.fromEntries(
  dateFnsLocalePaths.map((locale) => [`date-fns/locale/${locale}`, dateFnsLocaleShim]),
)

function patchPayloadDateFnsPlugin(): Plugin {
  return {
    name: 'patch-payload-date-fns',
    enforce: 'pre',
    transform(code, id) {
      if (!id.includes('importDateFNSLocale')) {
        return
      }

      return {
        code: code.replace(
          /await import\('date-fns\/locale\/[^']+'\)/g,
          `await import(${JSON.stringify(dateFnsLocaleShim)})`,
        ),
        map: null,
      }
    },
  }
}

function dateFnsLocaleAliasPlugin(): Plugin {
  return {
    name: 'date-fns-locale-alias',
    enforce: 'pre',
    resolveId(source) {
      if (source.startsWith('date-fns/locale/')) {
        return dateFnsLocaleShim
      }
    },
  }
}

/** Payload calls process.cwd() during init; workerd only provides a stub without cwd. */
function workerdProcessCwdPolyfill(): Plugin {
  const polyfill = 'if(typeof process.cwd!=="function"){process.cwd=()=>"/";}\n'
  return {
    name: 'workerd-process-cwd-polyfill',
    apply: 'build',
    renderChunk(code) {
      const envName = this.environment?.name
      if (envName !== 'rsc' && envName !== 'ssr') return null
      if (!code.includes('process.cwd')) return null
      return { code: polyfill + code, map: null }
    },
  }
}

export default defineConfig(({ command }) => ({
  legacy: {
    inconsistentCjsInterop: true,
  },
  plugins: [
    patchPayloadDateFnsPlugin(),
    dateFnsLocaleAliasPlugin(),
    workerdProcessCwdPolyfill(),
    ...(command === 'build'
      ? [
          cloudflare({
            viteEnvironment: { name: 'rsc', childEnvironments: ['ssr'] },
          }),
        ]
      : []),
    vinext(),
    payloadPlugin(),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      ...dateFnsLocaleAliases,
      ...payloadResolveAliases,
      'next/dist/compiled/@vercel/og/index.node.js': vercelOgShim,
      'next/dist/compiled/@vercel/og/index.edge.js': vercelOgShim,
      'pino-pretty': path.join(dirname, 'src/shims/pino-pretty.js'),
    },
  },
  build: {
    rolldownOptions: {
      resolve: {
        alias: {
          ...dateFnsLocaleAliases,
          ...payloadResolveAliases,
        },
      },
    },
  },
  optimizeDeps: {
    rolldownOptions: {
      resolve: {
        alias: {
          ...dateFnsLocaleAliases,
          ...payloadResolveAliases,
        },
      },
    },
  },
}))
