/** Browser-safe stub for Node path. */
const normalizeSlashes = (p) => p.replace(/\\/g, '/').replace(/\/+/g, '/')

export const join = (...parts) => normalizeSlashes(parts.filter(Boolean).join('/'))
export const resolve = (...parts) => join(...parts)
export const dirname = (p) => {
  const parts = normalizeSlashes(p).split('/')
  parts.pop()
  return parts.join('/') || '.'
}
export const basename = (p, ext) => {
  let name = normalizeSlashes(p).split('/').pop() || ''
  if (ext && name.endsWith(ext)) name = name.slice(0, -ext.length)
  return name
}
export const extname = (p) => {
  const name = basename(p)
  const i = name.lastIndexOf('.')
  return i > 0 ? name.slice(i) : ''
}
export const isAbsolute = (p) => p.startsWith('/')
export const relative = (_from, to) => to
export const parse = (p) => ({
  dir: dirname(p),
  base: basename(p),
  ext: extname(p),
  name: basename(p, extname(p)),
})

export default { join, resolve, dirname, basename, extname, isAbsolute, relative, parse }
