import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const shimsDir = path.dirname(fileURLToPath(import.meta.url))
const VIRTUAL_PREFIX = '\0payload-client-stub:'

/** npm packages with non-trivial export shapes — file-backed shims for browser client. */
const CLIENT_PACKAGES = {
  assert: 'assert.js',
  busboy: 'busboy.js',
  'ci-info': 'ci-info.js',
  child_process: 'child_process.js',
  crypto: 'crypto.js',
  'file-type': 'file-type.js',
  'get-tsconfig': 'get-tsconfig.js',
  module: 'module.js',
  os: 'os.js',
  path: 'path.js',
  pino: 'pino.js',
  'pino-pretty': 'pino-pretty.js',
  stream: 'stream.js',
  undici: 'undici.js',
  util: 'util.js',
  prompts: 'prompts.js',
  'sanitize-filename': 'sanitize-filename.js',
  url: 'url.js',
} as const

/** node: prefixed aliases for the same shims. */
const NODE_PREFIXED_PACKAGES = Object.fromEntries(
  Object.entries(CLIENT_PACKAGES).map(([pkg, file]) => [`node:${pkg}`, file]),
) as Record<string, string>

/** npm packages needed in workerd production server bundles (build only). */
const WORKERD_PACKAGES = {
  'file-type': 'file-type.js',
  pino: 'pino.js',
  'pino-pretty': 'pino-pretty.js',
  undici: 'undici.js',
  prompts: 'prompts.js',
} as const

/** Payload dist modules with file-backed shims (browser client only). */
const PAYLOAD_FILE_STUBS = {
  'uploads/safeFetch.js': 'safe-fetch.js',
  'uploads/fetchAPI-multipart/utilities.js': 'multipart-utilities.js',
  'utilities/telemetry/conf/envPaths.js': 'env-paths.js',
  'utilities/telemetry/oneWayHash.js': 'one-way-hash.js',
  'utilities/telemetry/index.js': 'telemetry-index.js',
} as const

/** Third-party modules reached via Payload import chains. */
const THIRD_PARTY_FILE_STUBS = {
  'get-tsconfig/dist/index.mjs': 'get-tsconfig.js',
  'image-size/dist/fromFile.mjs': 'image-size-from-file.js',
} as const

type VirtualExport =
  | { kind: 'async-noop'; name: string }
  | { kind: 'sync-noop'; name: string }
  | { kind: 'dynamic-import'; name: string }

/** Payload dist modules stubbed via generated virtual modules (browser client only). */
const PAYLOAD_VIRTUAL_STUBS: {
  suffix: string
  exports?: VirtualExport[]
  code?: string
}[] = [
  {
    suffix: 'utilities/dynamicImport.js',
    exports: [{ kind: 'dynamic-import', name: 'dynamicImport' }],
  },
  {
    suffix: 'uploads/saveBufferToFile.js',
    exports: [{ kind: 'async-noop', name: 'saveBufferToFile' }],
  },
  {
    suffix: 'utilities/dependencies/dependencyChecker.js',
    exports: [{ kind: 'async-noop', name: 'checkDependencies' }],
  },
  {
    suffix: 'utilities/addDataAndFileToRequest.js',
    exports: [{ kind: 'async-noop', name: 'addDataAndFileToRequest' }],
  },
  {
    suffix: 'uploads/fetchAPI-multipart/processMultipart.js',
    code: `export async function processMultipart() {
  return { fields: undefined, files: undefined };
}`,
  },
  {
    suffix: 'uploads/fetchAPI-multipart/index.js',
    code: `export async function processMultipartFormdata() {
  return { fields: undefined, files: undefined, error: undefined };
}`,
  },
  {
    suffix: 'uploads/fetchAPI-multipart/handlers.js',
    code: `export function memHandler() {}
export function tempFileHandler() {}`,
  },
  {
    suffix: 'uploads/fetchAPI-multipart/fileFactory.js',
    code: `export async function fileFactory() { return null; }`,
  },
  {
    suffix: 'uploads/fetchAPI-multipart/processNested.js',
    code: `export function processNested() {}`,
  },
  {
    suffix: 'uploads/fetchAPI-multipart/isEligibleRequest.js',
    code: `export function isEligibleRequest() { return false; }`,
  },
  {
    suffix: 'uploads/fetchAPI-stream-file/index.js',
    code: `export function iteratorToStream() { return new ReadableStream(); }
export async function* nodeStreamToIterator() {}
export function streamFile() { return new ReadableStream(); }`,
  },
  {
    suffix: 'uploads/deleteAssociatedFiles.js',
    exports: [{ kind: 'async-noop', name: 'deleteAssociatedFiles' }],
  },
  {
    suffix: 'uploads/unlinkTempFiles.js',
    exports: [{ kind: 'async-noop', name: 'unlinkTempFiles' }],
  },
  {
    suffix: 'uploads/generateFileData.js',
    exports: [{ kind: 'async-noop', name: 'generateFileData' }],
  },
  {
    suffix: 'uploads/checkFileRestrictions.js',
    exports: [{ kind: 'async-noop', name: 'checkFileRestrictions' }],
  },
  { suffix: 'uploads/getImageSize.js', exports: [{ kind: 'async-noop', name: 'getImageSize' }] },
  {
    suffix: 'uploads/image-resizing/createImageSizes.js',
    exports: [{ kind: 'async-noop', name: 'createImageSizes' }],
  },
  {
    suffix: 'uploads/endpoints/getFile.js',
    exports: [{ kind: 'async-noop', name: 'getFileHandler' }],
  },
  { suffix: 'uploads/tempFile.js', exports: [{ kind: 'async-noop', name: 'temporaryFileTask' }] },
  {
    suffix: 'utilities/dependencies/resolveFrom.js',
    code: `export function resolveFrom() { return null; }`,
  },
  {
    suffix: 'utilities/dependencies/realPath.js',
    code: `export async function realPath(p) { return p; }`,
  },
  {
    suffix: 'utilities/dependencies/getDependencies.js',
    code: `export function getDependencies() { return {}; }`,
  },
  {
    suffix: 'utilities/telemetry/conf/index.js',
    code: `export function getTelemetryConfig() { return {}; }`,
  },
  {
    suffix: 'bin/generateImportMap/index.js',
    code: `export async function generateImportMap() {}`,
  },
  {
    suffix: 'bin/generateImportMap/utilities/addPayloadComponentToImportMap.js',
    code: `export function addPayloadComponentToImportMap() {}`,
  },
  {
    suffix: 'bin/generateImportMap/utilities/getImportMapToBaseDirPath.js',
    code: `export function getImportMapToBaseDirPath() { return ''; }`,
  },
  {
    suffix: 'bin/generateImportMap/utilities/resolveImportMapFilePath.js',
    code: `export function resolveImportMapFilePath() { return ''; }`,
  },
]

function shimPath(file: string) {
  return path.join(shimsDir, file)
}

function shimDir(dir: string) {
  return path.join(shimsDir, dir)
}

function buildPackageAliases(packages: Record<string, string>) {
  return Object.fromEntries(Object.entries(packages).map(([pkg, file]) => [pkg, shimPath(file)]))
}

function matchesPayloadModule(source: string, importer: string | undefined, suffix: string) {
  const normalizedSuffix = suffix.replace(/\\/g, '/')
  const fileName = normalizedSuffix.split('/').pop()!
  const parentDir = normalizedSuffix.slice(0, -(fileName.length + 1))
  const normalizedSource = source.replace(/\\/g, '/')
  const normalizedImporter = importer?.replace(/\\/g, '/') ?? ''

  if (
    normalizedSource.endsWith(normalizedSuffix) ||
    normalizedSource.endsWith(`payload/dist/${normalizedSuffix}`)
  ) {
    return true
  }

  const sourceFileName = normalizedSource.split('/').pop()!
  if (sourceFileName !== fileName) return false

  return (
    normalizedSource.includes(`/${parentDir}/`) || normalizedImporter.includes(`/${parentDir}/`)
  )
}

function matchesThirdPartyModule(source: string, suffix: string) {
  const normalizedSuffix = suffix.replace(/\\/g, '/')
  const normalizedSource = source.replace(/\\/g, '/')
  return normalizedSource.endsWith(normalizedSuffix)
}

function generateVirtualModule(exports: VirtualExport[]) {
  return exports
    .map((entry) => {
      if (entry.kind === 'async-noop') {
        return `export async function ${entry.name}() {}`
      }
      if (entry.kind === 'sync-noop') {
        return `export function ${entry.name}() {}`
      }

      return `export async function ${entry.name}(spec) { return import(/* @vite-ignore */ spec) }`
    })
    .join('\n')
}

function shouldStubClient(envName: string | undefined) {
  // Only stub in the browser client environment. Undefined env (rsc/ssr build) must
  // keep real server deps like busboy for multipart login.
  return envName === 'client'
}

function resolveClientModule(source: string, importer: string | undefined) {
  const allPackages = { ...CLIENT_PACKAGES, ...NODE_PREFIXED_PACKAGES }

  if (source === 'fs' || source === 'node:fs') {
    return shimPath('fs/index.js')
  }
  if (source === 'fs/promises' || source === 'node:fs/promises') {
    return shimPath('fs/promises.js')
  }

  if (source in allPackages) {
    return shimPath(allPackages[source as keyof typeof allPackages])
  }

  for (const [suffix, file] of Object.entries(PAYLOAD_FILE_STUBS)) {
    const absolute = shimPath(file)
    if (source === absolute) return null
    if (matchesPayloadModule(source, importer, suffix)) return absolute
  }

  for (const [suffix, file] of Object.entries(THIRD_PARTY_FILE_STUBS)) {
    const absolute = shimPath(file)
    if (source === absolute) return null
    if (matchesThirdPartyModule(source, suffix)) return absolute
  }

  for (const { suffix } of PAYLOAD_VIRTUAL_STUBS) {
    if (matchesPayloadModule(source, importer, suffix)) {
      return `${VIRTUAL_PREFIX}${suffix}`
    }
  }
}

function clientRolldownPlugin() {
  return {
    name: 'payload-client-stubs:rolldown',
    resolveId(source: string, importer?: string) {
      return resolveClientModule(source, importer) ?? null
    },
  }
}

const clientPackageAliases = {
  ...buildPackageAliases({ ...CLIENT_PACKAGES, ...NODE_PREFIXED_PACKAGES }),
  fs: shimDir('fs'),
  'node:fs': shimDir('fs'),
  'fs/promises': shimPath('fs/promises.js'),
  'node:fs/promises': shimPath('fs/promises.js'),
}

const clientAliases = {
  ...clientPackageAliases,
  ...Object.fromEntries(
    Object.entries(PAYLOAD_FILE_STUBS).map(([suffix, file]) => [
      `payload/dist/${suffix}`,
      shimPath(file),
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(THIRD_PARTY_FILE_STUBS).map(([suffix, file]) => [suffix, shimPath(file)]),
  ),
}

const workerdAliases = buildPackageAliases(WORKERD_PACKAGES)

/**
 * Stub Payload Node/CJS imports that leak into the browser client bundle (dev + prod client builds).
 *
 * When /admin throws "Module X externalized" or "require is not defined":
 * 1. Add a line to PAYLOAD_VIRTUAL_STUBS (one export name), or
 * 2. Add to CLIENT_PACKAGES + a shim file if the export shape is non-trivial.
 */
export function payloadDevClientStubs(): Plugin {
  const rolldownPlugin = clientRolldownPlugin()

  return {
    name: 'payload-client-stubs',
    enforce: 'pre',
    config: () => ({
      define: {
        global: 'globalThis',
      },
      // Client-only stubs must not apply to rsc/ssr — e.g. busboy is required for
      // multipart login on the server; the no-op shim would hang forever.
      optimizeDeps: {
        rolldownOptions: {
          plugins: [rolldownPlugin],
          resolve: { alias: clientAliases },
        },
      },
    }),
    resolveId(source, importer) {
      if (!shouldStubClient(this.environment?.name)) return
      return resolveClientModule(source, importer) ?? undefined
    },
    load(id) {
      if (!shouldStubClient(this.environment?.name) || !id.startsWith(VIRTUAL_PREFIX)) return

      const suffix = id.slice(VIRTUAL_PREFIX.length)
      const entry = PAYLOAD_VIRTUAL_STUBS.find((stub) => stub.suffix === suffix)
      if (!entry) return

      return entry.code ?? generateVirtualModule(entry.exports ?? [])
    },
    transform(code, id) {
      if (!shouldStubClient(this.environment?.name)) return
      if (!code.includes('global._payload')) return

      return {
        code: code.replace(/\bglobal\._payload/g, 'globalThis._payload'),
        map: null,
      }
    },
  }
}

function workerdRolldownPlugin() {
  return {
    name: 'payload-workerd-shims:rolldown',
    resolveId(source: string) {
      return resolveWorkerdModule(source) ?? null
    },
  }
}

function resolveWorkerdModule(source: string) {
  if (source in WORKERD_PACKAGES) {
    return shimPath(WORKERD_PACKAGES[source as keyof typeof WORKERD_PACKAGES])
  }
}

/**
 * Build-only: minimal package aliases for workerd + process.cwd polyfill.
 */
export function payloadWorkerdShims(): Plugin {
  const cwdPolyfill = 'if(typeof process.cwd!=="function"){process.cwd=()=>"/";}\n'

  return {
    name: 'payload-workerd-shims',
    apply: 'build',
    config: () => ({
      resolve: { alias: workerdAliases },
      build: {
        rolldownOptions: {
          plugins: [workerdRolldownPlugin()],
          resolve: { alias: workerdAliases },
        },
      },
    }),
    resolveId(source) {
      return resolveWorkerdModule(source) ?? undefined
    },
    renderChunk(code) {
      const envName = this.environment?.name
      if (envName !== 'rsc' && envName !== 'ssr') return null
      if (!code.includes('process.cwd')) return null
      return { code: cwdPolyfill + code, map: null }
    },
  }
}
