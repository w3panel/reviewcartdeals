/** Browser-safe stub for Node os. */
export const platform = () => 'browser'
export const tmpdir = () => '/tmp'
export const homedir = () => '/tmp'
export const cpus = () => [
  { model: 'browser', speed: 0, times: { user: 0, nice: 0, sys: 0, idle: 0, irq: 0 } },
]
export const totalmem = () => 0
export const freemem = () => 0

export default { platform, tmpdir, homedir, cpus, totalmem, freemem }
