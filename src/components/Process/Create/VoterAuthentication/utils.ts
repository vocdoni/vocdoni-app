import type { OrgMemberAuthField, OrgMemberTwoFaField } from '@vocdoni/api-types'
import type { Census } from '../common'

export type TwoFAMethod = 'email' | 'sms' | 'voter_choice'

/** The one-time code choice as the modal shows it: "no code" is an option, not a switch. */
export type CodeMethod = 'none' | TwoFAMethod

export type VoterAuthFormData = {
  credentials: OrgMemberAuthField[]
  codeMethod: CodeMethod
}

/**
 * A product choice, not an API limit: past three details, voters mistype more
 * than the extra detail protects.
 */
export const MAX_AUTH_FIELDS = 3

/**
 * Details a stranger cannot easily look up. Names are public, so a census that
 * only asks for them protects little however many of them it asks for.
 */
export const PRIVATE_AUTH_FIELDS: readonly string[] = ['memberNumber', 'nationalId', 'birthDate']

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
  credentials: (census?.credentials ?? []) as OrgMemberAuthField[],
  codeMethod: census?.use2FA ? (census.use2FAMethod ?? 'email') : 'none',
})

export const toCensus = ({ credentials, codeMethod }: VoterAuthFormData): Census => ({
  credentials: [...credentials],
  use2FA: codeMethod !== 'none',
  // The stored shape always carries a method; it only means something while
  // `use2FA` is on.
  use2FAMethod: codeMethod === 'none' ? 'email' : codeMethod,
})

export const hasAuthConfig = ({ credentials, codeMethod }: VoterAuthFormData) =>
  credentials.length > 0 || codeMethod !== 'none'

/**
 * Order-insensitive identity of an auth configuration, used to tell an actual
 * change from a no-op re-save. Credentials are a set, not a sequence, and the
 * code method is irrelevant while no code is sent.
 */
export const censusConfigSignature = (census: Census) => {
  const { credentials, codeMethod } = fromCensus(census)
  return JSON.stringify([[...credentials].sort(), codeMethod])
}
