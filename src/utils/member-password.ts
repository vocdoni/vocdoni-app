import { hashMemberPassword } from '@vocdoni/api-client'

/**
 * Mirrors the trim and NFC normalization that the SDK's hashMemberPassword applies before hashing. The SDK does not
 * export its normaliser, so keep this in step with it: a password accepted here must hash the same way.
 */
const normalizeMemberPassword = (password: string): string => password.trim().normalize('NFC')

/**
 * Hashes the `password` of every row (see the SDK's hashMemberPassword). A row whose password is empty after
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
 * The requirements for a password an organizer sets: at least 6 characters (after trimming and NFC
 * normalization, like hashMemberPassword), with at least one letter and one number. Voters are never held to it.
 */
export const isValidMemberPassword = (password: string): boolean => {
  const normalized = normalizeMemberPassword(password)
  return normalized.length >= 6 && /\p{L}/u.test(normalized) && /\p{N}/u.test(normalized)
}
