import fs from 'fs'
import path from 'path'

const nextServerDir = path.join(process.cwd(), '.next/server')
const ogPattern = /@vercel\/og/

function collectNftFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectNftFiles(fullPath))
    } else if (entry.name.endsWith('.nft.json')) {
      files.push(fullPath)
    }
  }

  return files
}

let patched = 0

for (const nftPath of collectNftFiles(nextServerDir)) {
  const raw = fs.readFileSync(nftPath, 'utf-8')
  if (!ogPattern.test(raw)) {
    continue
  }

  const trace = JSON.parse(raw) as { version: number; files: string[] }
  const before = trace.files.length
  trace.files = trace.files.filter((file) => !ogPattern.test(file))

  if (trace.files.length === before) {
    continue
  }

  fs.writeFileSync(nftPath, JSON.stringify(trace))
  patched++
}

console.log(`Stripped @vercel/og from ${patched} nft.json trace file(s)`)
