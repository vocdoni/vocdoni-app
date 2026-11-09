/**
 * Test data generators. Everything is unique per run: the stack is disposable
 * but not reset between specs, so reusing an address would collide with the
 * previous run's account and, worse, read *its* verification mail.
 */

/**
 * `@test.local` matches the stack's `VOCDONI_EMAILFROMADDRESS` domain and is
 * never routable — MailHog captures everything regardless, but a non-routable
 * domain means a misconfigured stack can never actually mail a stranger.
 */
export const uniqueEmail = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@test.local`

/** Meets the signup form's 8-character minimum. */
export const TEST_PASSWORD = 'e2epassword123'

export type TestMember = {
  name: string
  surname: string
  email: string
  memberNumber: string
  /** Voting power for weighted processes. Optional: omitted, the CSV has no weight column. */
  weight?: number
  /** Member password, in plaintext as the organizer types it. Optional: omitted, the CSV has no password column. */
  password?: string
}

/**
 * A memberbase small enough to import in seconds. `memberNumber` is the CSP
 * auth field the voting flow authenticates with, `email` the 2FA channel the
 * OTP is sent to — both must be unique across the organization or the census
 * validation step in the create wizard rejects the configuration.
 *
 * `seed` scopes `memberNumber`, which only has to be unique *within* the
 * organization (each spec creates a fresh one). Addresses get their own random
 * run token instead: they share one long-lived MailHog inbox across every run
 * on a given stack, and callers pass a seed derived from the low digits of
 * `Date.now()`, which repeats roughly every 16 minutes. A repeat would leave a
 * previous run's OTP sitting in the inbox under the same address.
 */
export const makeMembers = (count: number, seed: string, weights?: number[]): TestMember[] => {
  const runToken = `${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`

  return Array.from({ length: count }, (_, index) => ({
    name: `Voter${index + 1}`,
    surname: 'Test',
    email: `member-${runToken}-${index + 1}@test.local`,
    memberNumber: `${seed}${index + 1}`,
    // Weighted processes reject a census whose members lack a voting power, so
    // when weights are requested every member must get one.
    ...(weights ? { weight: weights[index] } : {}),
  }))
}

/**
 * The members as a CSV buffer, matching the importer's expected header names.
 * The weight and password columns only exist when the members carry them — the
 * mapper in `importMembers` mirrors this, so both derive from the same data.
 */
export const membersCsv = (members: TestMember[]): Buffer => {
  const weighted = members.some((m) => m.weight !== undefined)
  const withPasswords = members.some((m) => m.password !== undefined)
  const header = `name,surname,email,memberNumber${weighted ? ',weight' : ''}${withPasswords ? ',password' : ''}`
  const rows = members.map(
    (m) =>
      `${m.name},${m.surname},${m.email},${m.memberNumber}${weighted ? `,${m.weight}` : ''}${
        withPasswords ? `,${m.password ?? ''}` : ''
      }`
  )
  return Buffer.from([header, ...rows].join('\n'), 'utf8')
}
