import type { MemberFieldId } from '../fields'

/** A file row as member fields */
export type MemberRecord = Partial<Record<MemberFieldId, string>>

export type IssueKind = 'invalid_email' | 'invalid_phone' | 'no_contact' | 'no_name'

/** A problem in a row, and the field that fixes it */
export type RowIssue = { kind: IssueKind; field: MemberFieldId }

export type DuplicateKey = 'memberNumber' | 'email' | 'nationalId'

/** Rows of the file that are the same person by one or more of `keys` */
export type DuplicateGroup = {
  /** Stable while the rows don't change: the first row's index and the keys */
  id: string
  keys: DuplicateKey[]
  /** Row indexes, in file order */
  rows: number[]
}

/** Who can get a voting code: by email, by SMS only, or not yet */
export type Readiness = 'email' | 'sms' | 'none'

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/

/** A phone without the spaces, dashes, dots and brackets people type in it */
export const cleanPhone = (value: string) => value.replace(/[\s\-.()]/g, '')

export const isValidEmail = (value?: string) => Boolean(value && EMAIL_PATTERN.test(value.trim()))
export const isValidPhone = (value?: string) => Boolean(value && PHONE_PATTERN.test(cleanPhone(value)))

const filled = (value?: string) => Boolean(value?.trim())

/** The problems of one row, in the order they're best fixed. */
export const rowIssues = (record: MemberRecord): RowIssue[] => {
  const issues: RowIssue[] = []
  if (!filled(record.name) && !filled(record.surname)) issues.push({ kind: 'no_name', field: 'name' })
  if (filled(record.email) && !isValidEmail(record.email)) issues.push({ kind: 'invalid_email', field: 'email' })
  if (filled(record.phone) && !isValidPhone(record.phone)) issues.push({ kind: 'invalid_phone', field: 'phone' })
  if (!filled(record.email) && !filled(record.phone)) issues.push({ kind: 'no_contact', field: 'email' })
  return issues
}

export const readinessOf = (record: MemberRecord): Readiness => {
  if (isValidEmail(record.email)) return 'email'
  if (isValidPhone(record.phone)) return 'sms'
  return 'none'
}

const DUPLICATE_KEYS: DuplicateKey[] = ['memberNumber', 'email', 'nationalId']

const duplicateValue = (key: DuplicateKey, value?: string) => {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return key === 'email' ? trimmed.toLowerCase() : trimmed.toUpperCase()
}

/**
 * Rows that share a member number, an email or a national ID. Rows linked through different keys
 * (A and B share an email, B and C a member number) form one group.
 */
export const findDuplicates = (records: MemberRecord[]): DuplicateGroup[] => {
  const parent = records.map((_, index) => index)
  const find = (index: number): number => (parent[index] === index ? index : (parent[index] = find(parent[index])))
  const keysOf = new Map<number, Set<DuplicateKey>>()

  for (const key of DUPLICATE_KEYS) {
    const firstWith = new Map<string, number>()
    records.forEach((record, index) => {
      const value = duplicateValue(key, record[key])
      if (!value) return
      const first = firstWith.get(value)
      if (first === undefined) {
        firstWith.set(value, index)
        return
      }
      parent[find(index)] = find(first)
      for (const row of [first, index]) keysOf.set(row, (keysOf.get(row) ?? new Set()).add(key))
    })
  }

  const groups = new Map<number, number[]>()
  records.forEach((_, index) => {
    if (!keysOf.has(index)) return
    const root = find(index)
    groups.set(root, [...(groups.get(root) ?? []), index])
  })

  return [...groups.values()].map((rows) => {
    const keys = DUPLICATE_KEYS.filter((key) => rows.some((row) => keysOf.get(row)?.has(key)))
    return { id: `${rows[0]}:${keys.join(',')}`, keys, rows }
  })
}

export type IssueReport = {
  /** The problems of each row */
  rows: RowIssue[][]
  duplicates: DuplicateGroup[]
}

/** The problems of each row and the duplicates among them. */
export const detectIssues = (records: MemberRecord[]): IssueReport => ({
  rows: records.map(rowIssues),
  duplicates: findDuplicates(records),
})

/** How many of these people can get a voting code by email, by SMS only, or neither yet. */
export const countReadiness = (records: MemberRecord[]): Record<Readiness, number> => {
  const counts: Record<Readiness, number> = { email: 0, sms: 0, none: 0 }
  records.forEach((record) => counts[readinessOf(record)]++)
  return counts
}
