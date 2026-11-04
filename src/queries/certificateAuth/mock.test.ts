import { createMockCertificateAuthApi, MOCK_HOLDER, MOCK_OTHER_HOLDER, MOCK_REFERENCE } from './mock'
import { CertAuthError } from './types'

const TOKEN_RE = /^[A-Za-z0-9._~-]{1,256}$/

const api = createMockCertificateAuthApi({ delayMs: 0, readOutcome: () => 'ok' })

describe('createMockCertificateAuthApi', () => {
  describe('create', () => {
    it('returns an authUrl starting with returnUrl', async () => {
      const { authUrl } = await api.create('pid', {
        challenge: 'x',
        challengeMethod: 'S256',
        returnUrl: 'http://localhost:3000/processes/p',
        purpose: 'vote',
      })
      expect(authUrl.startsWith('http://localhost:3000/processes/p')).toBe(true)
    })

    it('appends a fragment with code and state that pass the stash token grammar', async () => {
      const { authUrl, state } = await api.create('pid', {
        challenge: 'x',
        challengeMethod: 'S256',
        returnUrl: 'http://localhost:3000/processes/p',
        purpose: 'vote',
      })
      const fragment = authUrl.split('#')[1] ?? ''
      const params = new URLSearchParams(fragment)
      expect(TOKEN_RE.test(params.get('code') ?? '')).toBe(true)
      expect(TOKEN_RE.test(params.get('state') ?? '')).toBe(true)
      expect(params.get('state')).toBe(state)
    })

    it('state starts with mock-', async () => {
      const { state } = await api.create('pid', {
        challenge: 'x',
        challengeMethod: 'S256',
        returnUrl: 'http://localhost:3000/processes/p',
        purpose: 'vote',
      })
      expect(state.startsWith('mock-')).toBe(true)
    })
  })

  describe('redeem', () => {
    const getCode = async (purpose: 'vote' | 'check' = 'vote', outcome = 'ok') => {
      const a = createMockCertificateAuthApi({ delayMs: 0, readOutcome: () => outcome })
      const { authUrl } = await a.create('pid', {
        challenge: 'x',
        challengeMethod: 'S256',
        returnUrl: 'http://localhost:3000/processes/p',
        purpose,
      })
      const fragment = authUrl.split('#')[1] ?? ''
      return { code: new URLSearchParams(fragment).get('code')!, a }
    }

    it('ok vote: returns MOCK_HOLDER and authToken', async () => {
      const { code, a } = await getCode('vote', 'ok')
      const result = await a.redeem('pid', { code, verifier: 'v' })
      expect(result.holder).toEqual(MOCK_HOLDER)
      expect(result.authToken).toBe('mock-token')
      expect(result.weight).toBe('01')
    })

    it('ok check: returns MOCK_HOLDER and authToken null', async () => {
      const { code, a } = await getCode('check', 'ok')
      const result = await a.redeem('pid', { code, verifier: 'v' })
      expect(result.holder).toEqual(MOCK_HOLDER)
      expect(result.authToken).toBeNull()
      expect(result.weight).toBeUndefined()
    })

    it('dni_not_in_census: rejects with that reason and data.holder === MOCK_OTHER_HOLDER', async () => {
      const { code, a } = await getCode('vote', 'dni_not_in_census')
      await expect(a.redeem('pid', { code, verifier: 'v' })).rejects.toMatchObject({
        reason: 'dni_not_in_census',
        data: { holder: MOCK_OTHER_HOLDER },
      })
    })

    it('expired: carries issuer.id === "fnmt" and notAfter', async () => {
      const { code, a } = await getCode('vote', 'expired')
      await expect(a.redeem('pid', { code, verifier: 'v' })).rejects.toMatchObject({
        reason: 'expired',
        data: { issuer: { id: 'fnmt' }, notAfter: expect.any(String) },
      })
    })

    it('too_many_attempts: carries retryAfter 600 and no reference', async () => {
      const { code, a } = await getCode('vote', 'too_many_attempts')
      await expect(a.redeem('pid', { code, verifier: 'v' })).rejects.toMatchObject({
        reason: 'too_many_attempts',
        data: { retryAfter: 600 },
      })
      const error = await a
        .redeem('pid', { code: code.replace('too_many_attempts', 'too_many_attempts'), verifier: 'v' })
        .catch((e: CertAuthError) => e)
      expect((error as CertAuthError).data.reference).toBeUndefined()
    })

    it('unknown outcome rejects with internal', async () => {
      const { code, a } = await getCode('vote', 'totally_unknown_xyz')
      await expect(a.redeem('pid', { code, verifier: 'v' })).rejects.toMatchObject({
        reason: 'internal',
      })
    })

    it('reference matches MOCK_REFERENCE on successful redeem', async () => {
      const { code, a } = await getCode('vote', 'ok')
      const result = await a.redeem('pid', { code, verifier: 'v' })
      expect(result.reference).toBe(MOCK_REFERENCE)
    })
  })
})
