import {
  certAuthStorageKey,
  codeChallengeOf,
  readCertReturn,
  RETRYABLE_CERT_ERRORS,
  startCertAuth,
  STICKY_CERT_ERRORS,
  unansweredCertAuth,
} from './cert-auth'

const PID = '0123456789abcdef01234567'

const fakeWindow = (hash: string) => {
  const history = { state: { k: 1 }, replaceState: vi.fn() }
  const location = { hash, pathname: `/es/processes/${PID}`, search: '' }
  return { history, location }
}

describe('cert-auth', () => {
  beforeEach(() => sessionStorage.clear())

  it('classifies every gateway and backend code as the spec does', () => {
    expect([...STICKY_CERT_ERRORS].sort()).toEqual([
      'anonymous_unavailable',
      'expired',
      'identity_invalid',
      'identity_unsupported_document',
      'invalid_chain',
      'no_certificate',
      'not_cert_census',
      'not_in_census',
      'not_yet_valid',
      'process_not_open',
      'provider_mismatch',
      'revocation_unknown',
      'revoked',
      'test_certificate',
      'unsupported_profile',
      'unsupported_purpose',
      'untrusted_issuer',
      'weak_algorithm',
      'zero_weight',
    ])
    expect([...RETRYABLE_CERT_ERRORS].sort()).toEqual([
      'backend_unavailable',
      'internal',
      'rate_limited',
      'revocation_unavailable',
    ])
  })

  it('computes the RFC 7636 S256 challenge', async () => {
    expect(await codeChallengeOf('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    )
  })

  it('stores only state, codeVerifier, when it started and the page load, and sends the challenge to the gateway', async () => {
    const target = new URL(
      await startCertAuth({
        gatewayUrl: 'https://cert.vocdoni.io:15140',
        processId: PID,
        returnUrl: `https://app.vocdoni.io/es/processes/${PID}`,
        language: 'es',
      })
    )
    expect(sessionStorage).toHaveLength(1)
    const stored = JSON.parse(sessionStorage.getItem(certAuthStorageKey(PID))!)
    expect(Object.keys(stored).sort()).toEqual(['codeVerifier', 'loadId', 'startedAt', 'state'])
    expect(stored.loadId).toMatch(/^[A-Za-z0-9_-]{11}$/)
    expect(Date.now() - stored.startedAt).toBeLessThan(1000)
    expect(stored.state).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(stored.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/)

    expect(target.hostname).toMatch(/^[a-z2-7]{26}\.cert\.vocdoni\.io$/)
    expect(target.port).toBe('15140')
    expect(target.protocol + target.pathname).toBe('https:/v1/auth')
    expect(Object.fromEntries(target.searchParams)).toEqual({
      processId: PID,
      returnUrl: `https://app.vocdoni.io/es/processes/${PID}`,
      state: stored.state,
      codeChallenge: await codeChallengeOf(stored.codeVerifier),
      lang: 'es',
    })
  })

  it('sends every attempt to a fresh random subdomain of the gateway, same port and path', async () => {
    const start = () =>
      startCertAuth({
        gatewayUrl: 'https://cert.vocdoni.io:15140',
        processId: PID,
        returnUrl: 'https://a.test',
        language: 'en',
      }).then((u) => new URL(u))
    const [a, b] = [await start(), await start()]
    expect(a.host).not.toBe(b.host)
    for (const u of [a, b]) {
      const [label, ...rest] = u.hostname.split('.')
      expect(label).toMatch(/^[a-z2-7]{26}$/)
      expect(rest.join('.')).toBe('cert.vocdoni.io')
      expect(u.port).toBe('15140')
      expect(u.protocol + u.pathname).toBe('https:/v1/auth')
    }
  })

  it('sends no lang the gateway does not speak', async () => {
    const target = new URL(
      await startCertAuth({ gatewayUrl: 'https://g.test', processId: PID, returnUrl: 'https://a.test', language: 'de' })
    )
    expect(target.searchParams.has('lang')).toBe(false)
  })

  it('accepts a code with the stored state, strips the fragment and deletes the entry', () => {
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({ state: 's'.repeat(22), codeVerifier: 'v'.repeat(43) })
    )
    const { history, location } = fakeWindow(`#certCode=${'c'.repeat(43)}&state=${'s'.repeat(22)}`)

    expect(readCertReturn(PID, { history, location })).toEqual({
      kind: 'code',
      certCode: 'c'.repeat(43),
      codeVerifier: 'v'.repeat(43),
    })
    expect(history.replaceState).toHaveBeenCalledWith({ k: 1 }, '', `/es/processes/${PID}`)
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBeNull()
  })

  it('reads an error code', () => {
    sessionStorage.setItem(
      certAuthStorageKey(PID),
      JSON.stringify({ state: 's'.repeat(22), codeVerifier: 'v'.repeat(43) })
    )
    const { history, location } = fakeWindow(`#certError=not_in_census&state=${'s'.repeat(22)}`)
    expect(readCertReturn(PID, { history, location })).toEqual({ kind: 'error', code: 'not_in_census' })
  })

  it('reads the support reference of an error, and drops one that is not 32 hex digits', () => {
    const flow = JSON.stringify({ state: 's'.repeat(22), codeVerifier: 'v'.repeat(43) })
    const ref = '0123456789abcdef0123456789abcdef'
    sessionStorage.setItem(certAuthStorageKey(PID), flow)
    const ok = fakeWindow(`#certError=expired&ref=${ref}&state=${'s'.repeat(22)}`)
    expect(readCertReturn(PID, ok)).toEqual({ kind: 'error', code: 'expired', ref })

    sessionStorage.setItem(certAuthStorageKey(PID), flow)
    const bad = fakeWindow(`#certError=expired&ref=<b>hi</b>&state=${'s'.repeat(22)}`)
    expect(readCertReturn(PID, bad)).toStrictEqual({ kind: 'error', code: 'expired' })
  })

  describe('a certificate login this tab started that never answered', () => {
    const NOW = 1_800_000_000_000
    const key = certAuthStorageKey(PID)
    const store = (startedAt?: number, loadId = 'an earlier page load') =>
      sessionStorage.setItem(key, JSON.stringify({ state: 's', codeVerifier: 'v', startedAt, loadId }))
    const stored = () => JSON.parse(sessionStorage.getItem(key)!)

    it('is none while this page load is the one that left for the gateway, and the flow is kept', async () => {
      expect(unansweredCertAuth(PID, { now: NOW })).toBe(false)
      await startCertAuth({
        gatewayUrl: 'https://cert.test',
        processId: PID,
        returnUrl: 'https://app.test',
        language: 'en',
      })
      const flow = sessionStorage.getItem(key)
      expect(unansweredCertAuth(PID)).toBe(false)
      expect(sessionStorage.getItem(key)).toBe(flow)
    })

    it('means the gateway page did not load on a new page load moments later, told once, keeping the flow', () => {
      // a dropped port shows the browser's error page only after the TCP connect timeout (~2 min)
      store(NOW - 10 * 60_000)
      expect(unansweredCertAuth(PID, { now: NOW })).toBe(true)
      expect(stored()).toMatchObject({ state: 's', codeVerifier: 'v', hinted: true })
      expect(unansweredCertAuth(PID, { now: NOW })).toBe(false)

      // the gateway's late answer still signs in
      const { history, location } = fakeWindow('#certCode=c&state=s')
      expect(readCertReturn(PID, { history, location })).toEqual({ kind: 'code', certCode: 'c', codeVerifier: 'v' })
    })

    it('counts a page restored from the back/forward cache, which keeps this page load, told once', async () => {
      await startCertAuth({
        gatewayUrl: 'https://cert.test',
        processId: PID,
        returnUrl: 'https://app.test',
        language: 'en',
      })
      expect(unansweredCertAuth(PID, { restored: true })).toBe(true)
      expect(stored().hinted).toBe(true)
      expect(unansweredCertAuth(PID, { restored: true })).toBe(false)
      expect(stored().codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
    })

    it.each([
      ['it started long ago', NOW - 16 * 60_000],
      ['it has no start time', undefined],
    ])('is no failure when %s, and the flow is kept', (_, startedAt) => {
      store(startedAt)
      const flow = sessionStorage.getItem(key)
      expect(unansweredCertAuth(PID, { now: NOW })).toBe(false)
      expect(sessionStorage.getItem(key)).toBe(flow)
    })
  })

  it.each([
    ['another state', JSON.stringify({ state: 'x'.repeat(22), codeVerifier: 'v'.repeat(43) })],
    ['nothing stored', null],
  ])('a state mismatch (%s) strips the fragment, forgets the flow and yields no code', (_, stored) => {
    if (stored) sessionStorage.setItem(certAuthStorageKey(PID), stored)
    const { history, location } = fakeWindow(`#certCode=${'c'.repeat(43)}&state=${'s'.repeat(22)}`)

    expect(readCertReturn(PID, { history, location })).toEqual({ kind: 'mismatch' })
    expect(history.replaceState).toHaveBeenCalled()
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBeNull()
  })

  it('leaves any other fragment alone', () => {
    const { history, location } = fakeWindow('#questions')
    expect(readCertReturn(PID, { history, location })).toBeNull()
    expect(history.replaceState).not.toHaveBeenCalled()
  })
})
