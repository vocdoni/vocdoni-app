import { toCsv } from '~utils/download'
import { censusCsvRows, censusFileName, slugify } from './exportCsv'

const headers = {
  name: 'First Name',
  surname: 'Last Name',
  email: 'Email',
  phone: 'Phone',
  memberNumber: 'Member Number',
  nationalId: 'National ID',
  birthDate: 'Birth Date',
  weight: 'Weight',
}

describe('census export', () => {
  it('writes names, member numbers, emails and masked national IDs, never phones', () => {
    const rows = censusCsvRows(
      [
        {
          name: 'Anna',
          surname: 'Vila Puig',
          memberNumber: '00123',
          email: 'anna@example.org',
          nationalId: '12345678Z',
          phone: 'a1b2c3',
          birthDate: '1990-12-31',
        },
        { name: 'Jordi', email: 'jordi@example.org' },
      ],
      headers
    )

    expect(rows).toEqual([
      ['First Name', 'Last Name', 'Member Number', 'Email', 'National ID'],
      ['Anna', 'Vila Puig', '00123', 'anna@example.org', '•••78Z'],
      ['Jordi', '', '', 'jordi@example.org', ''],
    ])
    const csv = toCsv(rows)
    expect(csv).not.toContain('a1b2c3')
    expect(csv).not.toContain('12345678Z')
    expect(csv).not.toContain('1990')
  })

  it('names the file after the census and the day', () => {
    expect(slugify('Assemblea General 2026 · Socis amb quota!')).toBe('assemblea-general-2026-socis-amb-quota')
    expect(censusFileName('Junta Directiva', new Date(2026, 9, 2))).toBe('census-junta-directiva-2026-10-02.csv')
    expect(censusFileName('···', new Date(2026, 0, 5))).toBe('census-list-2026-01-05.csv')
  })
})
