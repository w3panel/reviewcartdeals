/** Minimal pino stub for workerd bundles — production uses a custom Payload logger instead. */
export function pino(options, destination) {
  const level = options?.level ?? 'info'
  const log =
    (lvl) =>
    (...args) => {
      const fn = console[lvl === 'fatal' ? 'error' : lvl] ?? console.log
      fn(...args)
    }

  return {
    level,
    trace: log('debug'),
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    fatal: log('error'),
    silent: () => {},
    child: () => pino(options, destination),
  }
}
