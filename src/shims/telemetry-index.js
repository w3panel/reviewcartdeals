/** Browser-safe stub for Payload telemetry (Node crypto/fs/child_process). */
export async function sendEvent() {}

export function getPayloadVersion() {
  return ''
}

export function getLocalizationInfo(payload) {
  if (!payload?.config?.localization) {
    return {
      locales: [],
      localizationDefaultLocale: null,
      localizationEnabled: false,
    }
  }

  return {
    locales: payload.config.localization.localeCodes,
    localizationDefaultLocale: payload.config.localization.defaultLocale,
    localizationEnabled: true,
  }
}
