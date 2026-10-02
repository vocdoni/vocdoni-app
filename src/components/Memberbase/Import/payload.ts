import { normaliseDate } from '~components/Spreadsheet/readTable'
import type { Table } from '~components/Spreadsheet/readTable'
import { MEMBER_FIELD_IDS, type MemberFieldId } from '../fields'
import type { ColumnTarget } from './autoMatch'
import { cleanPhone, type DuplicateGroup, isValidEmail, isValidPhone, type MemberRecord } from './detectIssues'

// The backend stores `other` as is (T9 will limit it), so the app keeps it small and safe for Mongo
export const MAX_EXTRA_COLUMNS = 20
export const MAX_EXTRA_KEY_LENGTH = 64
export const MAX_EXTRA_VALUE_LENGTH = 500

/** Fixes the admin made in the review step: row index → field → value */
export type RowEdits = Record<number, MemberRecord>

/** What to do with the rows of a duplicate group */
export type DuplicateDecision = 'first' | 'last' | 'both'

/**
 * A column header as a key of `other`: trimmed, without dots (Mongo reads them as paths) or a leading
 * `$` (operators), at most 64 characters. `fallback` names a header with nothing left.
 */
export const sanitiseExtraKey = (header: string, fallback: string) => {
  const key = header
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\./g, ' ')
    .replace(/^[\s$]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_EXTRA_KEY_LENGTH)
    .trim()
  return key || fallback
}

/** The `other` key of each kept column, unique even when two headers clean up the same. */
export const extraKeys = (header: string[], targets: ColumnTarget[]) => {
  const keys = new Map<number, string>()
  const used = new Set<string>()
  targets.forEach((target, index) => {
    if (target !== 'extra') return
    const base = sanitiseExtraKey(header[index], `column_${index + 1}`)
    let key = base
    for (let n = 2; used.has(key); n++) key = `${base.slice(0, MAX_EXTRA_KEY_LENGTH - 4)} (${n})`
    used.add(key)
    keys.set(index, key)
  })
  return keys
}

/** Each row as member fields, from the matched columns and the admin's fixes. */
export const toRecords = (table: Table, targets: ColumnTarget[], edits: RowEdits = {}): MemberRecord[] =>
  table.rows.map((row, index) => {
    const record: MemberRecord = {}
    targets.forEach((target, column) => {
      if ((MEMBER_FIELD_IDS as readonly string[]).includes(target) && row[column])
        record[target as MemberFieldId] = row[column]
    })
    return { ...record, ...edits[index] }
  })

/** The rows that are imported once the duplicates are settled ("both" when undecided). */
export const includedRows = (
  count: number,
  duplicates: DuplicateGroup[],
  decisions: Record<string, DuplicateDecision>
) => {
  const excluded = new Set<number>()
  for (const group of duplicates) {
    const decision = decisions[group.id] ?? 'both'
    if (decision === 'both') continue
    const keep = decision === 'first' ? group.rows[0] : group.rows[group.rows.length - 1]
    group.rows.filter((row) => row !== keep).forEach((row) => excluded.add(row))
  }
  return Array.from({ length: count }, (_, index) => index).filter((index) => !excluded.has(index))
}

export type MembersPayload = {
  members: Record<string, unknown>[]
  /** The table row each member came from: job errors name members by their position */
  sourceRows: number[]
  /** Birth dates turned from day-first into YYYY-MM-DD */
  europeanDates: number
}

/**
 * The members to send: only matched fields, without the values the review found wrong, birth dates
 * as YYYY-MM-DD, and the kept columns as `other`.
 */
export const buildMembersPayload = (
  table: Table,
  targets: ColumnTarget[],
  records: MemberRecord[],
  rows: number[]
): MembersPayload => {
  const keys = extraKeys(table.header, targets)
  let europeanDates = 0
  const members = rows.map((index) => {
    const { email, phone, birthDate, ...rest } = records[index]
    const member: Record<string, unknown> = { ...rest }
    if (isValidEmail(email)) member.email = email!.trim()
    if (isValidPhone(phone)) member.phone = cleanPhone(phone!)
    if (birthDate) {
      const date = normaliseDate(birthDate)
      if (date?.dayFirst) europeanDates++
      member.birthDate = date?.date ?? birthDate
    }
    if (keys.size) {
      member.other = Object.fromEntries(
        [...keys].map(([column, key]) => [key, (table.rows[index][column] ?? '').slice(0, MAX_EXTRA_VALUE_LENGTH)])
      )
    }
    return member
  })
  return { members, sourceRows: rows, europeanDates }
}
