import { ensureAddressPrefix } from './address'

const CANONICAL_ADDRESS = /^0x[0-9a-f]{40}$/

/**
 * The form a member password travels in, to the SaaS API and nowhere else: the plaintext never
 * leaves the browser. Organizers set it (member form, CSV import) and voters type it (CSP step 0)
 * through this one function, so both sides always derive the same value:
 *
 *   lowercase_hex(SHA-256(UTF-8("vocdoni-member-password:" + canonicalAddress(orgAddress) + ":" + trim(password))))
 *
 * where canonicalAddress is `0x` plus the lowercase address without any `0x` (ensureAddressPrefix).
 * Organization reads return the address `0x`-prefixed and checksummed while process reads return it
 * bare: hashing anything but the canonical form would lock every voter out.
 */
export const hashMemberPassword = async (orgAddress: string, password: string): Promise<string> => {
  const address = ensureAddressPrefix(orgAddress)
  if (!CANONICAL_ADDRESS.test(address)) {
    throw new Error(`Cannot hash a member password: invalid organization address "${orgAddress}"`)
  }
  const data = new TextEncoder().encode(`vocdoni-member-password:${address}:${password.trim()}`)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hashes the `password` of every row (see hashMemberPassword). A row whose password is empty after
 * trimming has no password, so the key is dropped rather than sent.
 */
export const hashMemberPasswords = async (
  orgAddress: string,
  rows: Record<string, string>[]
): Promise<Record<string, string>[]> =>
  Promise.all(
    rows.map(async ({ password, ...row }) =>
      password?.trim() ? { ...row, password: await hashMemberPassword(orgAddress, password) } : row
    )
  )

/**
 * The requirements for a password an organizer sets: at least 6 characters (after trimming, like
 * hashMemberPassword), with at least one letter and one number. Voters are never held to it.
 */
export const isValidMemberPassword = (password: string): boolean => {
  const trimmed = password.trim()
  return trimmed.length >= 6 && /\p{L}/u.test(trimmed) && /\p{N}/u.test(trimmed)
}
