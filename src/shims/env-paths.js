/** Browser-safe stub for Payload telemetry config paths. */
export function envPaths(name, { suffix = 'nodejs' } = {}) {
  if (suffix) name += `-${suffix}`

  const base = '/tmp'
  return {
    cache: `${base}/${name}/cache`,
    config: `${base}/${name}/config`,
    data: `${base}/${name}/data`,
    log: `${base}/${name}/log`,
    temp: `${base}/${name}/temp`,
  }
}
