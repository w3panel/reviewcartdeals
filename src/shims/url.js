/** Browser-safe stub for Node url (re-export Web URL where possible). */
export const fileURLToPath = (url) => String(url).replace(/^file:\/\//, '')
export const pathToFileURL = (p) => new URL(`file://${p}`)

export default { fileURLToPath, pathToFileURL }
