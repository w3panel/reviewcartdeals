/** Stub for `file-type` in workerd bundles — Node fs APIs are unavailable at runtime. */
export async function fileTypeFromBuffer() {
  return undefined
}

export async function fileTypeFromBlob() {
  return undefined
}

export async function fileTypeFromStream() {
  return undefined
}

export async function fileTypeFromFile() {
  return undefined
}

export async function fileTypeFromTokenizer() {
  return undefined
}

export function fileTypeStream() {
  return undefined
}

export const supportedExtensions = new Set()
export const supportedMimeTypes = new Set()

export class FileTypeParser {
  async fromBuffer() {
    return undefined
  }

  async fromBlob() {
    return undefined
  }

  async fromStream() {
    return undefined
  }

  async fromFile() {
    return undefined
  }

  async fromTokenizer() {
    return undefined
  }

  async toDetectionStream() {
    return undefined
  }
}
