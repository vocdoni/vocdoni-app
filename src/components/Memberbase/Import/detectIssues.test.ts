import { countReadiness, detectIssues, findDuplicates, isValidPhone, rowIssues } from './detectIssues'

describe('rowIssues', () => {
  it('finds a bad email, a bad phone, no way to reach them and no name', () => {
    expect(rowIssues({ name: 'Anna', email: 'anna@x', phone: '12' })).toEqual([
      { kind: 'invalid_email', field: 'email' },
      { kind: 'invalid_phone', field: 'phone' },
    ])
    expect(rowIssues({ surname: 'Vila' })).toEqual([{ kind: 'no_contact', field: 'email' }])
    expect(rowIssues({ email: 'anna@x.org' })).toEqual([{ kind: 'no_name', field: 'name' }])
    expect(rowIssues({ name: 'Anna', phone: '+34 612 345 678' })).toEqual([])
  })
})

describe('isValidPhone', () => {
  it('ignores spaces, dashes and dots', () => {
    expect(isValidPhone('612-34.56 78')).toBe(true)
    expect(isValidPhone('+34 612 345 678')).toBe(true)
    expect(isValidPhone('0034612345678')).toBe(false)
    expect(isValidPhone('1234')).toBe(false)
  })
})

describe('findDuplicates', () => {
  it('pairs rows sharing a member number, an email or a national ID', () => {
    const groups = findDuplicates([
      { memberNumber: '001', email: 'anna@x.org' },
      { memberNumber: '002', email: 'pere@x.org' },
      { memberNumber: '003', email: 'ANNA@x.org ' },
      { memberNumber: '002' },
      { nationalId: '1z' },
      { nationalId: '1Z' },
    ])

    expect(groups).toEqual([
      { id: '0:email', keys: ['email'], rows: [0, 2] },
      { id: '1:memberNumber', keys: ['memberNumber'], rows: [1, 3] },
      { id: '4:nationalId', keys: ['nationalId'], rows: [4, 5] },
    ])
  })

  it('joins rows linked through different keys into one group', () => {
    const groups = findDuplicates([
      { email: 'a@x.org' },
      { email: 'a@x.org', memberNumber: '7' },
      { memberNumber: '7' },
    ])
    expect(groups).toEqual([{ id: '0:memberNumber,email', keys: ['memberNumber', 'email'], rows: [0, 1, 2] }])
  })

  it('ignores empty values', () => {
    expect(findDuplicates([{ email: '' }, { email: ' ' }])).toEqual([])
  })
})

describe('detectIssues and countReadiness', () => {
  it('reports every row and who can get a code', () => {
    const records = [
      { name: 'Anna', email: 'anna@x.org' },
      { name: 'Pere', phone: '612345678' },
      { name: 'Laia', email: 'laia@', phone: '' },
    ]
    expect(detectIssues(records).rows).toEqual([[], [], [{ kind: 'invalid_email', field: 'email' }]])
    expect(countReadiness(records)).toEqual({ email: 1, sms: 1, none: 1 })
  })
})
