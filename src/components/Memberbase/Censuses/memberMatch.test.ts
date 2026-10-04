import { memberMatchesValue, normalizeIdentifier } from './memberMatch'

describe('normalizeIdentifier', () => {
  it('compares member numbers and IDs whatever Excel or the writer did to them', () => {
    expect(normalizeIdentifier(' 00123 ')).toBe('123')
    expect(normalizeIdentifier('0000')).toBe('0')
    expect(normalizeIdentifier('12.345.678-z')).toBe('12345678Z')
    expect(normalizeIdentifier('A-0042')).toBe('A0042')
  })
})

describe('memberMatchesValue', () => {
  const member = { email: 'Anna@Example.org', memberNumber: '00123', nationalId: '12345678Z' }

  it('matches an exact email, member number or national ID', () => {
    expect(memberMatchesValue(member, 'anna@example.org')).toBe(true)
    expect(memberMatchesValue(member, '123')).toBe(true)
    expect(memberMatchesValue(member, '12.345.678-z')).toBe(true)
  })

  it('never matches a value the member only contains', () => {
    expect(memberMatchesValue(member, 'anna')).toBe(false)
    expect(memberMatchesValue(member, '12')).toBe(false)
  })
})
