const normalizeAddress = (address: string) => address.toLowerCase().replace(/^0x/, '')

/**
 * Case-insensitive hex address comparison, tolerant of a missing `0x` prefix
 * (SAAS process reads return `orgAddress` unprefixed while orgs/auth endpoints
 * return it `0x`-prefixed; wallets may checksum).
 */
export const sameAddress = (a?: string | null, b?: string | null): boolean =>
  !!a && !!b && normalizeAddress(a) === normalizeAddress(b)
