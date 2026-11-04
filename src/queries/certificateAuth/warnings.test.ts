import { certificateCoverage, coverageFromCheck, readNationalIdWarnings } from './warnings'

describe('readNationalIdWarnings', () => {
  it('returns null for a bare string body (pre-SP1)', () => {
    expect(readNationalIdWarnings('"ok"\n')).toBeNull()
  })

  it('returns null when body is a plain object without nationalIdWarnings', () => {
    expect(readNationalIdWarnings({})).toBeNull()
  })

  it('returns empty array when nationalIdWarnings is null', () => {
    expect(readNationalIdWarnings({ nationalIdWarnings: null })).toEqual([])
  })

  it('drops entries with an unknown class', () => {
    const result = readNationalIdWarnings({
      nationalIdWarnings: [
        { memberId: 'a', class: 'derived_letter' },
        { memberId: 'b', class: 'missing' },
      ],
    })
    expect(result).toEqual([{ memberId: 'b', class: 'missing' }])
  })

  it('drops entries without a memberId', () => {
    const result = readNationalIdWarnings({
      nationalIdWarnings: [{ class: 'missing' }, { memberId: 'b', class: 'missing' }],
    })
    expect(result).toEqual([{ memberId: 'b', class: 'missing' }])
  })
})

describe('certificateCoverage', () => {
  it('computes cannotSignIn and counts for all warning classes', () => {
    // a=missing, b=letter_mismatch, c=invalid, d+f=duplicate_after_normalization, e=unsupported_document
    const warnings = [
      { memberId: 'a', class: 'missing' as const },
      { memberId: 'b', class: 'letter_mismatch' as const },
      { memberId: 'c', class: 'invalid' as const },
      { memberId: 'd', class: 'duplicate_after_normalization' as const },
      { memberId: 'e', class: 'unsupported_document' as const },
      { memberId: 'f', class: 'duplicate_after_normalization' as const },
    ]
    const result = certificateCoverage(warnings)

    expect(result.cannotSignIn).toBe(4)
    expect(result.duplicates).toEqual(expect.arrayContaining(['d', 'f']))
    expect(result.duplicates).toHaveLength(2)
    expect(result.counts).toEqual({ missing: 1, letter: 1, otherId: 2 })
  })

  it('counts a member listed both missing and letter only once (missing wins)', () => {
    const warnings = [
      { memberId: 'a', class: 'missing' as const },
      { memberId: 'a', class: 'letter_mismatch' as const },
    ]
    const result = certificateCoverage(warnings)

    expect(result.cannotSignIn).toBe(1)
    expect(result.missing).toEqual(['a'])
    expect(result.invalid).toHaveLength(0)
    expect(result.counts).toEqual({ missing: 1, letter: 0, otherId: 0 })
  })

  it('uses fallback lists when warnings is null', () => {
    const result = certificateCoverage(null, { missingData: ['x'], duplicates: ['y', 'z'] })

    expect(result.missing).toEqual(['x'])
    expect(result.duplicates).toEqual(expect.arrayContaining(['y', 'z']))
    expect(result.duplicates).toHaveLength(2)
  })
})

describe('coverageFromCheck', () => {
  it('uses SP1 warnings when present', () => {
    const warnings = [{ memberId: 'a', class: 'missing' as const }]
    const result = coverageFromCheck(warnings, { missingData: ['ignored'], duplicates: [] })

    expect(result.missing).toEqual(['a'])
  })

  it('falls back to issues when warnings is null', () => {
    const result = coverageFromCheck(null, { missingData: ['x'], duplicates: ['y'] })

    expect(result.missing).toEqual(['x'])
    expect(result.duplicates).toEqual(['y'])
  })

  it('falls back to issues when warnings is undefined', () => {
    const result = coverageFromCheck(undefined, { missingData: ['x'], duplicates: [] })

    expect(result.missing).toEqual(['x'])
  })
})
