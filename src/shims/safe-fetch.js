/** safeFetch shim — native fetch; Node dns/undici SSRF filtering is unavailable in browser/workerd. */
export const _internal_safeFetchGlobal = {
  lookup(_hostname, _options, callback) {
    if (typeof callback === 'function') {
      callback(null, '127.0.0.1', 4)
    }
  },
}

export const safeFetch = (...args) => globalThis.fetch(...args)
