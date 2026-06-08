/** Browser-safe stub for Node module. */
export const createRequire = () => () => {
  throw new Error('require() is not available in the browser')
}

export default { createRequire }
