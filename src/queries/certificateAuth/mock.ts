import type { CertificateAuthApi } from './client'
import { CertAuthError, isCertAuthServerCode, type CertAuthErrorData, type CertHolder } from './types'

/**
 * Mock adapter: set `localStorage.setItem('vocdoni.certMock.outcome', 'expired')` to override.
 * Default outcome is `ok`. The mock token is not a real CSP token; after "identified" the provider's
 * census check fails against a real backend. The mock never reaches the network for create/redeem.
 */
export const MOCK_OUTCOME_KEY = 'vocdoni.certMock.outcome'

export const MOCK_HOLDER: CertHolder = { fullName: 'Maria García López', documentType: 'DNI', documentEnding: '678Z' }
export const MOCK_OTHER_HOLDER: CertHolder = {
  fullName: 'Jordi Puig Serra',
  documentType: 'NIE',
  documentEnding: '567L',
}
export const MOCK_REFERENCE = '3f9a07c2e41b8d5c2a6f90b3c7e14d28'

const random = () => Math.random().toString(36).slice(2, 12)
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const errorData = (reason: CertAuthErrorData['reason']): Partial<CertAuthErrorData> => ({
  reason,
  retryable: reason === 'revocation_unavailable' || reason === 'internal',
  reference: reason === 'too_many_attempts' ? undefined : MOCK_REFERENCE,
  holder: reason === 'dni_not_in_census' ? MOCK_OTHER_HOLDER : undefined,
  issuer:
    reason === 'expired' || reason === 'weak_algorithm' || reason === 'revoked'
      ? { id: 'fnmt', name: 'FNMT' }
      : undefined,
  notAfter: reason === 'expired' ? '2026-10-03T00:00:00Z' : undefined,
  retryAfter: reason === 'too_many_attempts' ? 600 : undefined,
})

export const createMockCertificateAuthApi = ({
  readOutcome = () => (typeof localStorage === 'undefined' ? null : localStorage.getItem(MOCK_OUTCOME_KEY)) ?? 'ok',
  delayMs = 800,
}: { readOutcome?: () => string; delayMs?: number } = {}): CertificateAuthApi => ({
  create: async (_processId, { returnUrl, purpose }) => {
    await wait(delayMs / 2)
    const state = `mock-${random()}`
    const outcome = readOutcome().replace(/[^a-z_]/g, '') || 'ok'
    return {
      state,
      // Bare hex weight per Ruling R106; code embeds outcome and purpose for redeem to decode.
      authUrl: `${returnUrl}#code=mock.${outcome}.${purpose}.${random()}&state=${state}`,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    }
  },
  redeem: async (_processId, { code }, signal) => {
    const [, outcome = 'ok', purpose = 'vote'] = code.split('.')
    // Race the wait against the abort so mock `slow` stalls at the real 45 s timeout (preflight F9).
    await Promise.race([
      wait(outcome === 'slow' ? 50_000 : delayMs),
      new Promise((_, reject) => signal?.addEventListener('abort', () => reject(signal?.reason), { once: true })),
    ])
    if (outcome === 'ok' || outcome === 'slow')
      return {
        purpose: purpose === 'check' ? 'check' : 'vote',
        authToken: purpose === 'check' ? null : 'mock-token',
        // Bare hex like AuthResponse.weight, never "0x1" (Ruling R106).
        weight: purpose === 'check' ? undefined : '01',
        voterRef: 'mock-voter-ref',
        holder: MOCK_HOLDER,
        reference: MOCK_REFERENCE,
      }
    const reason = isCertAuthServerCode(outcome) ? outcome : 'internal'
    throw new CertAuthError(reason, errorData(reason))
  },
  probe: async () => {},
})
