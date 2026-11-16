import { certAuthStorageKey, codeChallengeOf, readCertReturn, startCertAuth } from './cert-auth'

const PID = '0123456789abcdef01234567'

const fakeWindow = (hash: string) => {
  const history = { state: { k: 1 }, replaceState: vi.fn() }
  const location = { hash, pathname: `/es/processes/${PID}`, search: '' }
  return { history, location }
}

describe('cert-auth', () => {
  beforeEach(() => sessionStorage.clear())

  it('computes the RFC 7636 S256 challenge', async () => {
    expect(await codeChallengeOf('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    )
  })

  it('stores only state and codeVerifier, and sends the challenge to the gateway', async () => {
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
    expect(Object.keys(stored).sort()).toEqual(['codeVerifier', 'state'])
    expect(stored.state).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(stored.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/)

    expect(target.origin + target.pathname).toBe('https://cert.vocdoni.io:15140/v1/auth')
    expect(Object.fromEntries(target.searchParams)).toEqual({
      processId: PID,
      returnUrl: `https://app.vocdoni.io/es/processes/${PID}`,
      state: stored.state,
      codeChallenge: await codeChallengeOf(stored.codeVerifier),
      lang: 'es',
    })
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

  it.each([
    ['another state', JSON.stringify({ state: 'x'.repeat(22), codeVerifier: 'v'.repeat(43) })],
    ['nothing stored', null],
  ])('a state mismatch (%s) strips the fragment, keeps the entry and yields no code', (_, stored) => {
    if (stored) sessionStorage.setItem(certAuthStorageKey(PID), stored)
    const { history, location } = fakeWindow(`#certCode=${'c'.repeat(43)}&state=${'s'.repeat(22)}`)

    expect(readCertReturn(PID, { history, location })).toEqual({ kind: 'mismatch' })
    expect(history.replaceState).toHaveBeenCalled()
    expect(sessionStorage.getItem(certAuthStorageKey(PID))).toBe(stored)
  })

  it('leaves any other fragment alone', () => {
    const { history, location } = fakeWindow('#questions')
    expect(readCertReturn(PID, { history, location })).toBeNull()
    expect(history.replaceState).not.toHaveBeenCalled()
  })
})
