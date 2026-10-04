import { utils, write } from 'xlsx'
import { csvBlob } from '~utils/download'
import type { MemberField, MemberFieldId } from '../fields'

export type TemplateFormat = 'xlsx' | 'csv'

export const TEMPLATE_FILE_NAMES: Record<TemplateFormat, string> = {
  xlsx: 'members-template.xlsx',
  csv: 'members-template.csv',
}

/** One realistic member, so the template shows what each column expects (leading zeros included). */
export const TEMPLATE_EXAMPLE: Record<MemberFieldId, string> = {
  name: 'Anna',
  surname: 'Vila Puig',
  email: 'anna.vila@example.org',
  phone: '+34612345678',
  memberNumber: '00123',
  nationalId: '12345678Z',
  birthDate: '1990-05-14',
  weight: '1',
}

/**
 * The template's rows: the field labels in the admin's language as headers (the import matches them
 * back exactly) and the example member.
 */
export const templateRows = (fields: Pick<MemberField, 'id' | 'label'>[]): string[][] => [
  fields.map((field) => field.label),
  fields.map((field) => TEMPLATE_EXAMPLE[field.id]),
]

const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export const templateBlob = (format: TemplateFormat, rows: string[][]): Blob => {
  if (format === 'csv') return csvBlob(rows)
  // Every cell is text, so member numbers keep their leading zeros and phones their "+"
  const sheet = utils.aoa_to_sheet(rows)
  sheet['!cols'] = rows[0].map((header) => ({ wch: Math.max(14, header.length + 2) }))
  const book = utils.book_new()
  utils.book_append_sheet(book, sheet, 'Members')
  return new Blob([write(book, { type: 'array', bookType: 'xlsx' })], { type: XLSX_TYPE })
}
