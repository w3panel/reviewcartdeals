import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

const dehashPattern = /((?:@[^/"'\s]+\/)?[^/"'\s]+?)-[0-9a-f]{16,}/g

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

export function ensureOpenNextTurbopackHook() {
  const bundleServerPath = path.join(
    root,
    'node_modules/@opennextjs/cloudflare/dist/cli/build/bundle-server.js',
  )
  const marker = 'dehashTurbopackChunks'
  let content = fs.readFileSync(bundleServerPath, 'utf8')

  if (content.includes(marker)) {
    return
  }

  const hookPath = path.join(root, 'src/scripts/patch-turbopack-externals.js').replace(/\\/g, '/')
  const injection = `
    const { dehashTurbopackChunks, patchOpenNextEnvShim } = await import(${JSON.stringify(`file://${hookPath}`)});
    const openNextChunksDir = path.join(buildOpts.outputDir, "server-functions/default", getPackagePath(buildOpts), ".next/server/chunks");
    const patchedChunks = dehashTurbopackChunks(openNextChunksDir);
    if (patchedChunks > 0) {
        console.log(\`Dehashed Turbopack externals in \${patchedChunks} OpenNext chunk file(s)\`);
    }
    patchOpenNextEnvShim(buildOpts.outputDir);
`

  content = content.replace(
    'console.log(`\\x1b[35m⚙️ Bundling the OpenNext server...\\n\\x1b[0m`);',
    `console.log(\`\\x1b[35m⚙️ Bundling the OpenNext server...\\n\\x1b[0m\`);${injection}`,
  )

  fs.writeFileSync(bundleServerPath, content)
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isCli) {
  const mode = process.argv[2]
  if (mode === 'hook') {
    ensureOpenNextTurbopackHook()
    console.log('OpenNext Turbopack hook installed')
  } else {
    const chunksDir = mode ?? path.join(root, '.next/server/chunks')
    const patched = dehashTurbopackChunks(chunksDir)
    console.log(`Dehashed Turbopack externals in ${patched} chunk file(s)`)
  }
}
