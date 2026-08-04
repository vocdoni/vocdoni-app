const normalizeAddress = (address: string) => address.toLowerCase().replace(/^0x/, '')

/** Prefix a hex string with `0x` when missing, preserving case (replaces the legacy SDK's `ensure0x`). */
export const ensure0x = (value: string): string => (value.startsWith('0x') ? value : `0x${value}`)

/**
 * Case-insensitive hex address comparison, tolerant of a missing `0x` prefix
 * (SAAS process reads return `orgAddress` unprefixed while orgs/auth endpoints
 * return it `0x`-prefixed; wallets may checksum).
 */
export const sameAddress = (a?: string | null, b?: string | null): boolean =>
  !!a && !!b && normalizeAddress(a) === normalizeAddress(b)

/**
 * Lowercase `0x`-prefixed form of a hex address, for endpoints that expect the
 * prefix (orgs/auth) when the value came from a SAAS process read (unprefixed).
 */
export const ensureAddressPrefix = (address: string) => `0x${normalizeAddress(address)}`
