import type { Table } from '~components/Spreadsheet/readTable'
import type { ColumnTarget } from './autoMatch'
import { buildMembersPayload, extraKeys, includedRows, sanitiseExtraKey, toRecords } from './payload'

const table: Table = {
  fileName: 'socis.csv',
  header: ['Nom', 'Correu', 'Mòbil', 'Naixement', 'Quota 2026', 'Obs.', 'Ignored'],
  rows: [
    ['Anna', 'anna@x.org', '612 345 678', '31/12/1990', 'Sí', 'x'.repeat(600), 'a'],
    ['Pere', 'pere@', '12', '1985-02-01', '', '', 'b'],
  ],
  rowNumbers: [3, 4],
  headerRowNumber: 2,
  fixes: [],
}
const targets: ColumnTarget[] = ['name', 'email', 'phone', 'birthDate', 'extra', 'extra', 'skip']

describe('sanitiseExtraKey', () => {
  it('drops dots, leading dollars and control characters, and caps the length', () => {
    expect(sanitiseExtraKey('  $$Núm. compte\u0007 ', 'x')).toBe('Núm compte')
    expect(sanitiseExtraKey('$.', 'column_3')).toBe('column_3')
    expect(sanitiseExtraKey('a'.repeat(80), 'x')).toHaveLength(64)
  })

  it('keeps keys unique', () => {
    const keys = extraKeys(['Quota.', 'Quota', 'Nom'], ['extra', 'extra', 'name'])
    expect([...keys.values()]).toEqual(['Quota', 'Quota (2)'])
  })
})

describe('toRecords', () => {
  it('maps matched columns and lays the review fixes on top', () => {
    expect(toRecords(table, targets, { 1: { email: 'pere@x.org' } })[1]).toEqual({
      name: 'Pere',
      email: 'pere@x.org',
      phone: '12',
      birthDate: '1985-02-01',
    })
  })
})

describe('includedRows', () => {
  const duplicates = [{ id: 'g', keys: ['email' as const], rows: [0, 2, 3] }]

  it('keeps everyone until the admin decides', () => {
    expect(includedRows(4, duplicates, {})).toEqual([0, 1, 2, 3])
  })

  it('keeps the first or the last of a group', () => {
    expect(includedRows(4, duplicates, { g: 'first' })).toEqual([0, 1])
    expect(includedRows(4, duplicates, { g: 'last' })).toEqual([1, 3])
  })
})

describe('buildMembersPayload', () => {
  it('sends matched fields, drops wrong values, fixes dates and keeps extras in other', () => {
    const records = toRecords(table, targets)
    const payload = buildMembersPayload(table, targets, records, [0, 1])

    expect(payload.members[0]).toEqual({
      name: 'Anna',
      email: 'anna@x.org',
      phone: '612345678',
      birthDate: '1990-12-31',
      other: { 'Quota 2026': 'Sí', Obs: 'x'.repeat(500) },
    })
    expect(payload.members[1]).toEqual({
      name: 'Pere',
      birthDate: '1985-02-01',
      other: { 'Quota 2026': '', Obs: '' },
    })
    expect(payload.europeanDates).toBe(1)
    expect(payload.sourceRows).toEqual([0, 1])
  })

  it('sends no other when no column is kept', () => {
    const plain: ColumnTarget[] = ['name', 'email', 'skip', 'skip', 'skip', 'skip', 'skip']
    const payload = buildMembersPayload(table, plain, toRecords(table, plain), [0])
    expect(payload.members).toEqual([{ name: 'Anna', email: 'anna@x.org' }])
  })
})
