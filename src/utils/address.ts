/** Case-insensitive hex address comparison (SAAS returns lowercase, wallets may checksum). */
export const sameAddress = (a?: string | null, b?: string | null): boolean =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase()
