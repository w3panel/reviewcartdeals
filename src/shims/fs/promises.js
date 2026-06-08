/** Browser-safe stub for Node fs/promises. */
const noop = async () => {}

export const readFile = async () => new Uint8Array()
export const writeFile = noop
export const mkdir = noop
export const unlink = noop
export const stat = async () => ({
  isFile: () => false,
  isDirectory: () => false,
  size: 0,
})
export const access = noop
export const rm = noop

export default { readFile, writeFile, mkdir, unlink, stat, access, rm }
