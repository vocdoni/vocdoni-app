import {
  CERT_AUTH_SERVER_CODES,
  CERT_CHECK_CODES,
  formatReference,
  isCertAuthServerCode,
  RECOVERY_CODES,
} from './types'

describe('certificate contract types', () => {
  it('lists the 16 cert-check codes verbatim plus the backend reasons', () => {
    expect(CERT_CHECK_CODES).toHaveLength(16)
    expect(CERT_AUTH_SERVER_CODES).toEqual(
      expect.arrayContaining([
        'dni_not_in_census',
        'attempt_expired',
        'code_used',
        'verifier_mismatch',
        'too_many_attempts',
      ])
    )
    expect(isCertAuthServerCode('expired')).toBe(true)
    expect(isCertAuthServerCode('session_lost')).toBe(false)
  })
  it('treats expired attempts, used codes and lost sessions as recoveries, not errors', () => {
    for (const code of ['attempt_expired', 'code_used', 'verifier_mismatch', 'session_lost'] as const)
      expect(RECOVERY_CODES.has(code)).toBe(true)
    expect(RECOVERY_CODES.has('expired')).toBe(false)
  })
  it('shows the first 12 hex digits grouped and copies them compact', () => {
    expect(formatReference('3f9a07c2e41b8d5c2a6f90b3c7e14d28')).toEqual({
      shown: '3F9A 07C2 E41B',
      copy: '3f9a07c2e41b',
    })
    expect(formatReference('short')).toBeNull()
    expect(formatReference(undefined)).toBeNull()
  })
})
