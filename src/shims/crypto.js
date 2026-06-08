/** Browser-safe stub for Node crypto. */
export const randomBytes = (size) => new Uint8Array(size)
export const randomUUID = () => '00000000-0000-4000-8000-000000000000'

export const createHash = () => {
  const api = {
    update() {
      return api
    },
    digest() {
      return 'dev-stub'
    },
  }
  return api
}

export const createHmac = createHash

export default { randomBytes, randomUUID, createHash, createHmac }
