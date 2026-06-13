import type { Access } from 'payload'

/** Authenticated Payload admin users only. */
export const isLoggedIn: Access = ({ req: { user } }) => Boolean(user)
