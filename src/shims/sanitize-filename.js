/** ESM shim for CJS sanitize-filename (Payload uploads). */
const illegalRe = /[/\\?<>\\:*|"]/g
const controlRe = /[\x00-\x1f\x80-\x9f]/g
const reservedRe = /^\.+$/
const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i
const windowsTrailingRe = /[. ]+$/

function truncateUtf8(input, maxBytes) {
  const bytes = new TextEncoder().encode(input)
  if (bytes.length <= maxBytes) {
    return input
  }

  let end = maxBytes
  while (end > 0 && (bytes[end] & 0xc0) === 0x80) {
    end--
  }

  return new TextDecoder().decode(bytes.subarray(0, end))
}

function sanitize(input, replacement) {
  if (typeof input !== 'string') {
    throw new Error('Input must be string')
  }

  return truncateUtf8(
    input
      .replace(illegalRe, replacement)
      .replace(controlRe, replacement)
      .replace(reservedRe, replacement)
      .replace(windowsReservedRe, replacement)
      .replace(windowsTrailingRe, replacement),
    255,
  )
}

export default function sanitizeFilename(input, options) {
  const replacement = (options && options.replacement) || ''
  const output = sanitize(input, replacement)
  if (replacement === '') {
    return output
  }
  return sanitize(output, '')
}
