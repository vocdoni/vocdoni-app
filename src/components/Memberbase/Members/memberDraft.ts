import { sameAddress } from '~utils/address'

type MemberDraft = {
  organization: string
  processId: string
  values: Record<string, string>
  passwordHash?: string
  bought: boolean
}

// A refused member is personal data: it lives in memory only, never in storage or router state, and
// its password only as the hash that was sent.
let draft: MemberDraft | undefined

export const saveMemberDraft = (next: Omit<MemberDraft, 'bought'>) => {
  draft = { ...next, bought: false }
}

export const markMemberDraftBought = (processId: string) => {
  if (draft?.processId === processId) draft = { ...draft, bought: true }
}

// Taking the draft clears it: a draft is reopened once. Another organization's draft is dropped too.
export const takeMemberDraft = (organization: string): MemberDraft | undefined => {
  const current = draft
  draft = undefined
  return current && sameAddress(current.organization, organization) ? current : undefined
}

export const clearMemberDraft = () => {
  draft = undefined
}
