import { getMemberField, type MemberFieldId } from '~components/Memberbase/fields'
import { MASK_DOTS } from '~components/ui/MaskedValue'
import type { Member } from '~src/queries/members'

/**
 * What a census export holds, in this order: enough to check a list or print it for a meeting. Never
 * the phone (only a hash is stored, and it isn't needed), and the national ID masked.
 */
export const CENSUS_EXPORT_FIELDS: MemberFieldId[] = ['name', 'surname', 'memberNumber', 'email', 'nationalId']

const cell = (member: Partial<Member>, field: MemberFieldId) => {
  const value = member[field as keyof Member]
  if (field !== 'nationalId') return String(value ?? '').trim()
  const display = getMemberField('nationalId')!.mask(value ? String(value) : '')
  return display.kind === 'masked' ? `${MASK_DOTS}${display.tail}` : ''
}

/** The rows of a census CSV: the translated header, then one row per person. */
export const censusCsvRows = (members: Partial<Member>[], headers: Record<MemberFieldId, string>): string[][] => [
  CENSUS_EXPORT_FIELDS.map((field) => headers[field]),
  ...members.map((member) => CENSUS_EXPORT_FIELDS.map((field) => cell(member, field))),
]

/** "Assemblea General 2026" → "assemblea-general-2026", for file names. */
export const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
    .replace(/-+$/g, '')

const pad = (value: number) => String(value).padStart(2, '0')

/** `census-{slug}-{YYYY-MM-DD}.csv`, dated in the admin's time zone. */
export const censusFileName = (name: string, date = new Date()) => {
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
  return `census-${slugify(name) || 'list'}-${day}.csv`
}
