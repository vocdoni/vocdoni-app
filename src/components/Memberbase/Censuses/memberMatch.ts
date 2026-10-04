import type { Member } from '~src/queries/members'

type Matchable = Pick<Member, 'email' | 'memberNumber' | 'nationalId'>

/**
 * A member number or national ID as it compares: uppercase, without spaces, dots or dashes, and an
 * all-digit one without leading zeros. Excel turns "00123" into 123 and IDs are written "1234-5678-Z"
 * as often as "12345678Z": they still name the same person.
 */
export const normalizeIdentifier = (value: string) => {
  const compact = value
    .trim()
    .toUpperCase()
    .replace(/[\s.\-]+/g, '')
  return /^\d+$/.test(compact) ? compact.replace(/^0+(?=\d)/, '') : compact
}

/** The keys a member can be found by: their email, member number and national ID. */
const memberKeys = (member: Matchable) => {
  const keys: string[] = []
  const email = member.email?.trim().toLowerCase()
  const memberNumber = member.memberNumber ? normalizeIdentifier(member.memberNumber) : ''
  const nationalId = member.nationalId ? normalizeIdentifier(member.nationalId) : ''
  if (email) keys.push(`email:${email}`)
  if (memberNumber) keys.push(`number:${memberNumber}`)
  if (nationalId) keys.push(`id:${nationalId}`)
  return keys
}

/** The keys a value could match: an exact email, member number or national ID. */
const valueKeys = (value: string) => {
  if (value.includes('@')) return [`email:${value.toLowerCase()}`]
  const normalized = normalizeIdentifier(value)
  return [`number:${normalized}`, `id:${normalized}`]
}

/** Whether a member is exactly what a value names (not just contains it, as search does). */
export const memberMatchesValue = (member: Matchable, value: string) => {
  const keys = new Set(memberKeys(member))
  return valueKeys(value).some((key) => keys.has(key))
}
