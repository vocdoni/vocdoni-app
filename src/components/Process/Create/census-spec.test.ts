import { buildCensusSpec } from './census-spec'
import { defaultProcessValues } from './common'

describe('buildCensusSpec', () => {
  it('develop parity: details census produces spec with no authMethod key', () => {
    const form = {
      ...defaultProcessValues,
      groupId: 'g',
      census: {
        credentials: ['memberNumber'],
        use2FA: true,
        use2FAMethod: 'sms' as const,
      },
    }
    const spec = buildCensusSpec(form)

    expect(spec).toEqual({
      groupId: 'g',
      weighted: undefined,
      anonymous: undefined,
      authFields: ['memberNumber'],
      twoFaFields: ['phone'],
    })
    expect('authMethod' in spec).toBe(false)
  })

  it('certificate method produces authMethod and nationalId authFields, no twoFaFields', () => {
    const form = {
      ...defaultProcessValues,
      groupId: 'g',
      census: {
        method: 'certificate' as const,
        credentials: ['nationalId'],
        use2FA: false,
        use2FAMethod: 'email' as const,
      },
    }
    const spec = buildCensusSpec(form)

    expect(spec.authMethod).toBe('certificate')
    expect(spec.authFields).toEqual(['nationalId'])
    expect(spec.twoFaFields).toBeUndefined()
  })
})
