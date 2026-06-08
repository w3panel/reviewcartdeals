/** Browser-safe stub for Node util. */
export const promisify = (fn) => fn
export const inspect = (value) => String(value)
export const format = (...args) => args.join(' ')
export const deprecate = (fn) => fn
export const isDeepStrictEqual = (a, b) => a === b

const util = { promisify, inspect, format, deprecate, isDeepStrictEqual }

export default util
