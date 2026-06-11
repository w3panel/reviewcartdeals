import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const hookPath = path.join(root, 'src/scripts/patch-turbopack-externals.js').replace(/\\/g, '/')
const hookImport = JSON.stringify(`file://${hookPath}`)
const HOOK_VERSION = 'workerBundleSizeV1'

const dehashPattern = /((?:@[^/"'\s]+\/)?[^/"'\s]+?)-[0-9a-f]{16,}/g

/** Paths that should not ship in the Cloudflare Worker bundle. */
const TRACE_STRIP_PATTERNS = [
  /@vercel\/og/,
  /drizzle-kit/,
  /[\\/]sharp(?:[\\/]|$)/,
  /[\\/]@img[\\/]/,
  /pino-pretty/,
  /[\\/]wrangler[\\/]/,
  /thread-stream[\\/]test/,
]

export function dehashTurbopackChunks(chunksDir) {
  if (!fs.existsSync(chunksDir)) {
    return 0
  }

  let patched = 0

  function walk(dir) {
    const files = []
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...walk(fullPath))
      } else if (entry.name.endsWith('.js')) {
        files.push(fullPath)
      }
    }
    return files
  }

  for (const filePath of walk(chunksDir)) {
    const raw = fs.readFileSync(filePath, 'utf-8')
    if (!dehashPattern.test(raw)) {
      continue
    }

    dehashPattern.lastIndex = 0
    const patchedContent = raw.replace(dehashPattern, '$1')
    if (patchedContent === raw) {
      continue
    }

    fs.writeFileSync(filePath, patchedContent)
    patched++
  }

  return patched
}

function collectNftFiles(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectNftFiles(fullPath))
    } else if (entry.name.endsWith('.nft.json')) {
      files.push(fullPath)
    }
  }
  return files
}

function shouldStripTraceFile(file) {
  return TRACE_STRIP_PATTERNS.some((pattern) => pattern.test(file))
}

/** Remove dev-only / Node-only deps from Next.js NFT traces before OpenNext copies them. */
export function stripProductionTraces(appBuildOutputPath) {
  const nextServerDir = path.join(appBuildOutputPath, '.next/server')
  let patched = 0

  for (const nftPath of collectNftFiles(nextServerDir)) {
    const raw = fs.readFileSync(nftPath, 'utf-8')
    if (!TRACE_STRIP_PATTERNS.some((pattern) => pattern.test(raw))) {
      continue
    }

    const trace = JSON.parse(raw)
    const before = trace.files.length
    trace.files = trace.files.filter((file) => !shouldStripTraceFile(file))

    if (trace.files.length === before) {
      continue
    }

    fs.writeFileSync(nftPath, JSON.stringify(trace))
    patched++
  }

  if (patched > 0) {
    console.log(`Stripped dev-only traces from ${patched} nft.json file(s)`)
  }

  return patched
}

/** Drop copied assets that should never run on Workers. */
export function pruneWorkerBundleDeps(outputDir, packagePath) {
  const relPaths = [
    'node_modules/next/dist/compiled/@vercel/og',
    'node_modules/sharp',
    'node_modules/@img',
  ]

  for (const relPath of relPaths) {
    const candidates = [
      path.join(outputDir, 'server-functions/default', packagePath, relPath),
      path.join(outputDir, 'server-functions/default', relPath),
    ]

    for (const target of candidates) {
      if (fs.existsSync(target)) {
        fs.rmSync(target, { recursive: true, force: true })
        console.log(`Removed ${path.relative(outputDir, target)} from Worker bundle`)
      }
    }
  }
}

export function patchOpenNextEnvShim(outputDir) {
  const envPath = path.join(outputDir, 'cloudflare-templates/shims/env.js')
  if (!fs.existsSync(envPath)) {
    return
  }

  fs.writeFileSync(
    envPath,
    'export function loadEnvConfig() {}\nexport default { loadEnvConfig };\n',
  )
}

/** Collapse Payload's date-fns locale imports to en-US only (~2 MiB saved). */
export function createDateFnsLocalePlugin() {
  const enUsPath = path.join(root, 'node_modules/date-fns/locale/en-US.js')

  return {
    name: 'date-fns-locale-en-us-only',
    setup(build) {
      build.onResolve({ filter: /^date-fns\/locale\/.+/ }, (args) => ({
        path: enUsPath,
      }))
    },
  }
}

function patchFileOnce(filePath, marker, transform) {
  let content = fs.readFileSync(filePath, 'utf8')

  if (content.includes(marker)) {
    return false
  }

  content = transform(content)
  fs.writeFileSync(filePath, content)
  return true
}

export function ensureOpenNextHooks() {
  const buildPath = path.join(root, 'node_modules/@opennextjs/cloudflare/dist/cli/build/build.js')
  const bundleServerPath = path.join(
    root,
    'node_modules/@opennextjs/cloudflare/dist/cli/build/bundle-server.js',
  )

  const buildPatched = patchFileOnce(buildPath, HOOK_VERSION, (content) =>
    content.replace(
      'buildNextjsApp(options);',
      `buildNextjsApp(options);
    // ${HOOK_VERSION}
    {
      const { stripProductionTraces } = await import(${hookImport});
      stripProductionTraces(options.appBuildOutputPath);
    }`,
    ),
  )

  const bundlePatched = patchFileOnce(bundleServerPath, HOOK_VERSION, (content) => {
    let next = content

    // Remove legacy hook injection if present.
    next = next.replace(
      /\n    const \{ dehashTurbopackChunks, patchOpenNextEnvShim \} = await import\([\s\S]*?patchOpenNextEnvShim\(buildOpts\.outputDir\);\n/m,
      '\n',
    )

    next = next.replace(
      'console.log(`\\x1b[35m⚙️ Bundling the OpenNext server...\\n\\x1b[0m`);',
      `console.log(\`\\x1b[35m⚙️ Bundling the OpenNext server...\\n\\x1b[0m\`);
    // ${HOOK_VERSION}
    const { dehashTurbopackChunks, patchOpenNextEnvShim, pruneWorkerBundleDeps } = await import(${hookImport});
    const openNextChunksDir = path.join(buildOpts.outputDir, "server-functions/default", getPackagePath(buildOpts), ".next/server/chunks");
    const patchedChunks = dehashTurbopackChunks(openNextChunksDir);
    if (patchedChunks > 0) {
        console.log(\`Dehashed Turbopack externals in \${patchedChunks} OpenNext chunk file(s)\`);
    }
    patchOpenNextEnvShim(buildOpts.outputDir);
    pruneWorkerBundleDeps(buildOpts.outputDir, getPackagePath(buildOpts));`,
    )

    next = next.replace(
      '"@next/env": path.join(buildOpts.outputDir, "cloudflare-templates/shims/env.js"),',
      `"@next/env": path.join(buildOpts.outputDir, "cloudflare-templates/shims/env.js"),
            // ${HOOK_VERSION} — dev-only deps not needed on Workers (push: false, custom logger, no OG)
            "drizzle-kit": path.join(buildOpts.outputDir, "cloudflare-templates/shims/throw.js"),
            "drizzle-kit/api": path.join(buildOpts.outputDir, "cloudflare-templates/shims/throw.js"),
            "sharp": path.join(buildOpts.outputDir, "cloudflare-templates/shims/throw.js"),
            "pino-pretty": ${JSON.stringify(path.join(root, 'src/shims/pino-pretty.js').replace(/\\/g, '/'))},`,
    )

    return next
  })

  return { buildPatched, bundlePatched }
}

/** @deprecated Use ensureOpenNextHooks */
export function ensureOpenNextTurbopackHook() {
  ensureOpenNextHooks()
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  const mode = process.argv[2]
  if (mode === 'hook') {
    const { buildPatched, bundlePatched } = ensureOpenNextHooks()
    if (buildPatched || bundlePatched) {
      console.log('OpenNext Worker bundle-size hooks installed')
    } else {
      console.log('OpenNext Worker bundle-size hooks already installed')
    }
  } else {
    const chunksDir = mode ?? path.join(root, '.next/server/chunks')
    const patched = dehashTurbopackChunks(chunksDir)
    console.log(`Dehashed Turbopack externals in ${patched} chunk file(s)`)
  }
}
