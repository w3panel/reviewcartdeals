/** ESM default export shim for CJS ci-info (Payload telemetry). */
function readEnv() {
  if (typeof process !== 'undefined' && process.env) {
    return process.env
  }

  return {}
}

const env = readEnv()

const isCI = !!(
  env.CI !== 'false' &&
  (env.BUILD_ID ||
    env.BUILD_NUMBER ||
    env.CI ||
    env.CI_APP_ID ||
    env.CI_BUILD_ID ||
    env.CI_BUILD_NUMBER ||
    env.CI_NAME ||
    env.CONTINUOUS_INTEGRATION ||
    env.RUN_ID ||
    false)
)

const ciInfo = {
  isCI,
  isPR: null,
  name: isCI ? (env.CI_NAME ?? null) : null,
  id: null,
}

export default ciInfo
export const { isPR, name, id } = ciInfo
export { isCI }
