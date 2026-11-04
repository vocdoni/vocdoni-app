import type { CensusSpec } from '@vocdoni/api-types'
import { isCertificateCensus } from './census'
import type { AppCensusSpec } from './census'

describe('isCertificateCensus', () => {
  it('returns false when mode is off, whatever the census', () => {
    expect(isCertificateCensus({ authMethod: 'certificate' } as AppCensusSpec, 'off')).toBe(false)
    expect(isCertificateCensus({ authFields: ['nationalId'] } as CensusSpec, 'off')).toBe(false)
  })

  it('returns true when census has authMethod certificate and mode is on', () => {
    expect(isCertificateCensus({ authMethod: 'certificate' } as AppCensusSpec, 'on')).toBe(true)
  })

  it('returns false for a nationalId-only census without authMethod when mode is on', () => {
    expect(isCertificateCensus({ authFields: ['nationalId'] } as CensusSpec, 'on')).toBe(false)
  })

  it('returns true for a nationalId-only census without authMethod when mode is mock', () => {
    expect(isCertificateCensus({ authFields: ['nationalId'] } as CensusSpec, 'mock')).toBe(true)
  })

  it('returns false for a nationalId census with twoFaFields in mock mode', () => {
    expect(isCertificateCensus({ authFields: ['nationalId'], twoFaFields: ['email'] } as CensusSpec, 'mock')).toBe(
      false
    )
  })

  it('returns false for null census', () => {
    expect(isCertificateCensus(null, 'on')).toBe(false)
  })

  it('returns false for undefined census', () => {
    expect(isCertificateCensus(undefined, 'mock')).toBe(false)
  })
})
