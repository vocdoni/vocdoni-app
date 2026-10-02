import type { CollectedMember, Member } from '~src/queries/members'

/** Above the in-memory limit, each value is a search request: this many at most per paste. */
export const PASTE_REMOTE_MAX_VALUES = 200

/** Search requests in flight at once when matching value by value. */
export const PASTE_REMOTE_CONCURRENCY = 4

/**
 * The values in a pasted column (or row): split on new lines, commas, semicolons and tabs, trimmed,
 * unquoted and deduplicated. Emails are lowercased, since that's how they compare.
 */
export const parsePastedValues = (text: string): string[] => {
  const seen = new Set<string>()
  const values: string[] = []
  for (const piece of text.split(/[\r\n,;\t]+/)) {
    let value = piece
      .trim()
      .replace(/^["']+|["']+$/g, '')
      .trim()
    if (!value) continue
    if (value.includes('@')) value = value.toLowerCase()
    if (seen.has(value)) continue
    seen.add(value)
    values.push(value)
  }
  return values
}

type Matchable = Pick<Member, 'email' | 'memberNumber' | 'nationalId'>

/** The keys a member can be found by: their email, member number and national ID. */
const memberKeys = (member: Matchable) => {
  const keys: string[] = []
  const email = member.email?.trim().toLowerCase()
  const memberNumber = member.memberNumber?.trim()
  const nationalId = member.nationalId?.trim().toUpperCase()
  if (email) keys.push(`email:${email}`)
  if (memberNumber) keys.push(`number:${memberNumber}`)
  if (nationalId) keys.push(`id:${nationalId}`)
  return keys
}

/** The keys a pasted value could match: an exact email, member number or national ID. */
const valueKeys = (value: string) =>
  value.includes('@') ? [`email:${value.toLowerCase()}`] : [`number:${value}`, `id:${value.toUpperCase()}`]

/** Whether a member is exactly what a value names (not just contains it, as search does). */
export const memberMatchesValue = (member: Matchable, value: string) => {
  const keys = new Set(memberKeys(member))
  return valueKeys(value).some((key) => keys.has(key))
}

export type PasteMatch = {
  /** Everyone named by a value, once each, in the order of the values */
  found: CollectedMember[]
  /** The values that matched nobody */
  notFound: string[]
}

/** Matches values against members already in memory. */
export const matchPastedValues = (values: string[], members: CollectedMember[]): PasteMatch => {
  const index = new Map<string, CollectedMember[]>()
  members.forEach((member) => memberKeys(member).forEach((key) => index.set(key, [...(index.get(key) ?? []), member])))

  const found = new Map<string, CollectedMember>()
  const notFound: string[] = []
  values.forEach((value) => {
    const matches = valueKeys(value).flatMap((key) => index.get(key) ?? [])
    if (!matches.length) notFound.push(value)
    matches.forEach((member) => found.set(member.id, member))
  })
  return { found: [...found.values()], notFound }
}

type RemoteOptions = {
  signal?: AbortSignal
  onProgress?: (checked: number) => void
  concurrency?: number
}

/**
 * Matches values one search request each, a few at a time, keeping only the members a value names
 * exactly. For organizations too big to load into memory.
 */
export const matchPastedValuesRemotely = async (
  values: string[],
  search: (value: string) => Promise<Member[]>,
  { signal, onProgress, concurrency = PASTE_REMOTE_CONCURRENCY }: RemoteOptions = {}
): Promise<PasteMatch> => {
  const results: CollectedMember[][] = new Array(values.length)
  let next = 0
  let checked = 0

  const worker = async () => {
    while (next < values.length) {
      if (signal?.aborted) throw new DOMException('Matching was stopped', 'AbortError')
      const index = next++
      const value = values[index]
      const members = await search(value)
      results[index] = members.filter(
        (member): member is CollectedMember => !!member.id && memberMatchesValue(member, value)
      )
      checked += 1
      onProgress?.(checked)
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker))
  if (signal?.aborted) throw new DOMException('Matching was stopped', 'AbortError')

  const found = new Map<string, CollectedMember>()
  const notFound: string[] = []
  values.forEach((value, index) => {
    if (!results[index].length) notFound.push(value)
    results[index].forEach((member) => found.set(member.id, member))
  })
  return { found: [...found.values()], notFound }
}
