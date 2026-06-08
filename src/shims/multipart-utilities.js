/** Browser-safe stub for Payload multipart upload utilities. */
export const debugLog = () => false

export const getTempFilename = (prefix = 'tmp') => `${prefix}-dev-${Date.now()}`

export const isFunc = (value) => typeof value === 'function'

export const promiseCallback = (resolve, reject) => {
  let hasFired = false
  return (err) => {
    if (hasFired) return
    hasFired = true
    return err ? (typeof reject === 'function' ? reject(err) : resolve()) : resolve()
  }
}

export const isSafeFromPollution = () => true

export const buildFields = (instance, field, value) => {
  if (value === null || value === undefined) return instance

  instance = instance || Object.create(null)
  if (!instance[field]) {
    instance[field] = value
    return instance
  }

  if (instance[field] instanceof Array) {
    instance[field].push(value)
  } else {
    instance[field] = [instance[field], value]
  }

  return instance
}

export const checkAndMakeDir = () => false

export const deleteFile = (_filePath, callback) => {
  callback?.()
}

export const moveFile = (_src, _dst, callback) => {
  callback?.(null, true)
}

export const saveBufferToFile = (_buffer, _filePath, callback) => {
  callback?.()
}

export const parseFileNameExtension = (preserveExtension, fileName) => {
  const defaultResult = { name: fileName, extension: '' }
  if (!preserveExtension || !fileName) return defaultResult

  const parts = fileName.split('.')
  if (parts.length < 2) return defaultResult

  const extension = parts.pop() || ''
  return { name: parts.join('.'), extension }
}

export const parseFileName = (_opts, fileName) => fileName || getTempFilename()
