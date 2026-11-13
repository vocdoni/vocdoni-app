import type { Member } from '~src/queries/members'

// The name a member is listed and announced by: "name surname", else the email, else the member number.
export const memberAlias = (member: Member) =>
  [member.name, member.surname].filter(Boolean).join(' ') || member.email || member.memberNumber
