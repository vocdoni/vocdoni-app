import type { OrgMemberAuthField, OrgMemberTwoFaField } from '@vocdoni/api-types'
import type { Census } from '../common'

export type TwoFAMethod = 'email' | 'sms' | 'voter_choice'

/** The one-time code choice as the modal shows it: "no code" is an option, not a switch. */
export type CodeMethod = 'none' | TwoFAMethod

// The member password never identifies a voter on its own: the backend finds the participant on
// the other credentials, then checks the password. So it does not count toward the credentials
// limit, and it needs another credential or 2FA next to it.
export const PASSWORD_CREDENTIAL = 'password'

export type VoterAuthField = OrgMemberAuthField | typeof PASSWORD_CREDENTIAL

export type VoterAuthFormData = {
  credentials: VoterAuthField[]
  codeMethod: CodeMethod
}

/**
 * A product choice, not an API limit: past three details, voters mistype more
 * than the extra detail protects.
 */
export const MAX_AUTH_FIELDS = 3

/**
 * Details a stranger cannot easily look up. Names are public, so a census that
 * only asks for them protects little however many of them it asks for. The
 * password is something only the member knows, so it counts as private too.
 */
export const PRIVATE_AUTH_FIELDS: readonly string[] = ['memberNumber', 'nationalId', 'birthDate', PASSWORD_CREDENTIAL]

export const countedCredentials = (credentials: readonly string[]): number =>
  credentials.filter((credential) => credential !== PASSWORD_CREDENTIAL).length

export const passwordNeedsAnotherCredential = (credentials: readonly string[], codeMethod: CodeMethod): boolean =>
  credentials.includes(PASSWORD_CREDENTIAL) && countedCredentials(credentials) === 0 && codeMethod === 'none'

export const getTwoFaFields = (method: TwoFAMethod): OrgMemberTwoFaField[] => {
  switch (method) {
    case 'email':
      return ['email']
    case 'sms':
      return ['phone']
    case 'voter_choice':
      return ['email', 'phone']
  }
}

export const getCodeTwoFaFields = (method: CodeMethod): OrgMemberTwoFaField[] =>
  method === 'none' ? [] : getTwoFaFields(method)

export const fromCensus = (census?: Census | null): VoterAuthFormData => ({
  credentials: (census?.credentials ?? []) as VoterAuthField[],
  codeMethod: census?.use2FA ? (census.use2FAMethod ?? 'email') : 'none',
})

export const toCensus = ({ credentials, codeMethod }: VoterAuthFormData): Census => ({
  credentials: [...credentials],
  use2FA: codeMethod !== 'none',
  // The stored shape always carries a method; it only means something while
  // `use2FA` is on.
  use2FAMethod: codeMethod === 'none' ? 'email' : codeMethod,
})

export const hasAuthConfig = ({
  credentials,
  codeMethod,
}: {
  credentials: readonly string[]
  codeMethod: CodeMethod
}) => credentials.length > 0 || codeMethod !== 'none'

/**
 * Order-insensitive identity of an auth configuration, used to tell an actual
 * change from a no-op re-save. Credentials are a set, not a sequence, and the
 * code method is irrelevant while no code is sent.
 */
export const censusConfigSignature = (census: Census) => {
  const { credentials, codeMethod } = fromCensus(census)
  return JSON.stringify([[...credentials].sort(), codeMethod])
}
