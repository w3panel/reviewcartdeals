import type { PayloadRequest } from 'payload'

export function isAutosaveRequest(req: PayloadRequest): boolean {
  return req.query?.autosave === 'true' || req.query?.autosave === true
}
