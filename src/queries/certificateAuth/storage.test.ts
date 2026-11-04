import {
  challengeFor,
  clearReturnStash,
  createVerifier,
  dropVerifier,
  purgeExpiredVerifiers,
  readPending,
  readReturnStash,
  readVerifier,
  RETURN_STASH_KEY,
  saveVerifier,
  setPending,
  VERIFIER_TTL_MS,
} from './storage'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('PKCE verifier', () => {
  it('matches RFC 7636 appendix B', async () => {
    expect(await challengeFor('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    )
  })
  it('creates 43-char base64url verifiers that differ', () => {
    const a = createVerifier()
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(createVerifier()).not.toBe(a)
  })
  it('lasts longer than the server state and code together', () => {
    expect(VERIFIER_TTL_MS).toBe(20 * 60_000)
  })
})

describe('verifier store', () => {
  const entry = { verifier: 'v'.repeat(43), processId: 'p1', purpose: 'vote' as const, expiresAt: Date.now() + 60_000 }
  it('reads back by state for the same process only', () => {
    expect(saveVerifier('st1', entry)).toBe(true)
    expect(readVerifier('st1', 'p1')).toEqual(entry)
    expect(readVerifier('st1', 'p2')).toBeNull()
    expect(localStorage.getItem('vocdoni.cert.verifier.st1')).toBeNull()
  })
  it('drops expired and malformed entries', () => {
    saveVerifier('old', { ...entry, expiresAt: Date.now() - 1 })
    localStorage.setItem('vocdoni.cert.verifier.bad', '{"x":1}')
    saveVerifier('ok', entry)
    purgeExpiredVerifiers()
    expect(localStorage.getItem('vocdoni.cert.verifier.old')).toBeNull()
    expect(localStorage.getItem('vocdoni.cert.verifier.bad')).toBeNull()
    expect(readVerifier('ok', 'p1')).not.toBeNull()
    dropVerifier('ok')
    expect(readVerifier('ok', 'p1')).toBeNull()
  })
  it('refuses states outside the token grammar', () => {
    expect(saveVerifier('a/b', entry)).toBe(false)
  })
  it('reports a storage failure instead of throwing', () => {
    // vitest.setup.ts replaces localStorage with a plain vi.fn mock: spy on it, not Storage.prototype.
    vi.mocked(localStorage.setItem).mockImplementationOnce(() => {
      throw new Error('QuotaExceededError')
    })
    expect(saveVerifier('st2', entry)).toBe(false)
  })
})

describe('pending marker and return stash', () => {
  it('expires the pending marker after 15 minutes', () => {
    setPending('p1', { state: 's', startedAt: Date.now() - 16 * 60_000 })
    expect(readPending('p1')).toBeNull()
    setPending('p1', { state: 's', startedAt: Date.now() })
    expect(readPending('p1')?.state).toBe('s')
  })
  it('ignores a pending marker whose state is missing or outside the token grammar', () => {
    localStorage.setItem('vocdoni.cert.pending.p1', JSON.stringify({ startedAt: Date.now() }))
    expect(readPending('p1')).toBeNull()
    localStorage.setItem('vocdoni.cert.pending.p1', JSON.stringify({ state: 42, startedAt: Date.now() }))
    expect(readPending('p1')).toBeNull()
    localStorage.setItem('vocdoni.cert.pending.p1', JSON.stringify({ state: '../x', startedAt: Date.now() }))
    expect(readPending('p1')).toBeNull()
    setPending('p1', { state: 'ok-state', startedAt: Date.now() })
    expect(readPending('p1')?.state).toBe('ok-state')
  })
  it('validates the stash again and expires it after 5 minutes', () => {
    sessionStorage.setItem(RETURN_STASH_KEY, JSON.stringify({ code: 'c', state: 's', at: Date.now() }))
    expect(readReturnStash()).toMatchObject({ code: 'c', state: 's' })
    sessionStorage.setItem(RETURN_STASH_KEY, JSON.stringify({ code: '<x>', state: 's', at: Date.now() }))
    expect(readReturnStash()).toBeNull()
    sessionStorage.setItem(RETURN_STASH_KEY, JSON.stringify({ error: 'attempt_expired', at: Date.now() - 6 * 60_000 }))
    expect(readReturnStash()).toBeNull()
    clearReturnStash()
    expect(sessionStorage.getItem(RETURN_STASH_KEY)).toBeNull()
  })
})
