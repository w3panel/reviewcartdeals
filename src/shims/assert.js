/** Browser-safe stub for Node assert. */
export default function assert(value, message) {
  if (!value) throw new Error(message ?? 'Assertion failed')
}

export function ok(value, message) {
  assert(value, message)
}
