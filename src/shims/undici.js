/** undici stub for workerd — native fetch is used instead of undici's SSRF-safe client. */
export class Agent {
  constructor(_options) {}
}

export const fetch = globalThis.fetch.bind(globalThis)

const undici = { Agent, fetch }
export default undici
