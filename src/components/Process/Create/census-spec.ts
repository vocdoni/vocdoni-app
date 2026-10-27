import type { CensusSpec, OrgMemberAuthField } from '@vocdoni/api-types'
import type { Process } from './common'
import { getTwoFaFields } from './VoterAuthentication/utils'

type CensusSpecSource = Pick<Process, 'groupId' | 'weightedVote' | 'anonymousVoting' | 'census'>

/**
 * The census a process is published with, from the builder form. Also what the
 * voter sign-in modal validates before saving, so the pre-flight check and the
 * publish can never disagree on what they send.
 */
export const buildCensusSpec = (form: CensusSpecSource): CensusSpec => {
  const spec: CensusSpec = {
    // The backend builds the group's voter list on every save, keyed on the
    // voters' credentials. Without them every voter collides and the save fails,
    // so a draft only commits to its group once authentication is set up.
    // Publishing requires it anyway, so this only ever affects drafts.
    groupId: (form.census && form.groupId) || undefined,
    weighted: form.weightedVote || undefined,
    // Blind-CSP census: omitted rather than sent as `false`, matching how the
    // other optional flags are built here.
    anonymous: form.anonymousVoting || undefined,
  }
  if (form.census?.credentials?.length) {
    spec.authFields = form.census.credentials as OrgMemberAuthField[]
  }
  if (form.census?.use2FA && form.census?.use2FAMethod) {
    spec.twoFaFields = getTwoFaFields(form.census.use2FAMethod)
  }
  return spec
}
