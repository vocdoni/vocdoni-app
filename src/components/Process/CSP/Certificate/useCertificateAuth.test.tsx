import { act, renderHook, waitFor } from '@testing-library/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ElectionProvider, useElectionAuth } from '@vocdoni/react-providers'
import { TestProvider } from '@vocdoni/react-providers/test-utils'
import type { ReactNode } from 'react'
import type { CertificateAuthApi } from '~queries/certificateAuth/client'
import { readPending, readVerifier, RETURN_STASH_KEY, saveVerifier, setPending } from '~queries/certificateAuth/storage'
import { CertAuthError } from '~queries/certificateAuth/types'
import { useCertificateAuth } from './useCertificateAuth'

// The real provider tree: undo vitest.setup.ts's stubs for this file.
vi.mock('@vocdoni/react-providers', async (importOriginal) => importOriginal())
vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const providers = await vi.importActual<typeof import('@vocdoni/react-providers')>('@vocdoni/react-providers')
  return {
    ...(await importOriginal<typeof import('@vocdoni/react-components')>()),
    useElection: providers.useElection,
    useElectionAuth: providers.useElectionAuth,
  }
})

const election = {
  id: 'p1',
  orgAddress: '0x1',
  title: { default: 'T' },
  chainId: 'c',
  status: 'ONGOING',
  census: { authFields: ['nationalId'], twoFaFields: [], authMethod: 'certificate' },
  questions: [],
} as unknown as VotingProcessResponse
const question = (status: string) => ({ id: 'q1', upstreamId: 'u1', status, title: { default: 'Q' }, choices: [] })
const holder = { fullName: 'Maria García López', documentType: 'DNI' as const, documentEnding: '678Z' }
const wrapperFor =
  (process: VotingProcessResponse) =>
  ({ children }: { children: ReactNode }) => (
    <TestProvider>
      <ElectionProvider election={process}>{children}</ElectionProvider>
    </TestProvider>
  )
const wrapper = wrapperFor(election)
const api = (over: Partial<CertificateAuthApi> = {}): CertificateAuthApi => ({
  create: vi.fn(async () => ({
    state: 'st1',
    authUrl: 'https://n1.cert.auth.test/v1/authenticate?state=st1',
    expiresAt: '',
  })),
  redeem: vi.fn(async () => ({ purpose: 'vote' as const, authToken: 'tok', voterRef: 'ref', holder, reference: 'r' })),
  probe: vi.fn(async () => {}),
  ...over,
})
const verifierFor = (state: string) =>
  saveVerifier(state, { verifier: 'v'.repeat(43), processId: 'p1', purpose: 'vote', expiresAt: Date.now() + 60_000 })
const stash = (code: string, state: string) =>
  sessionStorage.setItem(RETURN_STASH_KEY, JSON.stringify({ code, state, at: Date.now() }))
const json = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      json(String(url).endsWith('/check') ? { belongsToProcess: true, questions: [] } : election)
    )
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

describe('useCertificateAuth', () => {
  it('start stores the verifier by state, marks the attempt and navigates', async () => {
    const navigate = vi.fn()
    const a = api()
    const { result } = renderHook(() => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: a, navigate }), {
      wrapper,
    })
    await waitFor(() => expect(result.current.phase.kind).toBe('idle'))
    await act(() => result.current.start())
    expect(navigate).toHaveBeenCalledWith('https://n1.cert.auth.test/v1/authenticate?state=st1')
    expect(readVerifier('st1', 'p1')?.verifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(readPending('p1')?.state).toBe('st1')
    expect(vi.mocked(a.create).mock.calls[0][1]).toMatchObject({
      challengeMethod: 'S256',
      purpose: 'vote',
      returnUrl: `${location.origin}${location.pathname}`,
    })
  })

  it('never puts the query or fragment in the return URL', async () => {
    window.history.replaceState(null, '', '/processes/p1?identify=cert-escape&certmock=1#x')
    const a = api()
    const { result } = renderHook(
      () => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: a, navigate: vi.fn() }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.phase.kind).toBe('idle'))
    await act(() => result.current.start())
    expect(vi.mocked(a.create).mock.calls[0][1].returnUrl).toBe(`${location.origin}/processes/p1`)
  })

  it('refuses a non-https auth URL', async () => {
    const navigate = vi.fn()
    const a = api({ create: vi.fn(async () => ({ state: 's', authUrl: 'http://evil.test/', expiresAt: '' })) })
    const { result } = renderHook(() => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: a, navigate }), {
      wrapper,
    })
    await waitFor(() => expect(result.current.phase.kind).toBe('idle'))
    await act(() => result.current.start())
    expect(navigate).not.toHaveBeenCalled()
    expect(result.current.phase).toMatchObject({ kind: 'error' })
    expect(readVerifier('s', 'p1')).toBeNull()
  })

  it('redeems a stashed code once and connects the provider', async () => {
    verifierFor('st1')
    stash('c1', 'st1')
    const a = api()
    const { result } = renderHook(
      () => ({ cert: useCertificateAuth({ processId: 'p1', purpose: 'vote', api: a }), auth: useElectionAuth() }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.cert.phase.kind).toBe('identified'))
    expect(result.current.auth.connected).toBe(true)
    expect(a.redeem).toHaveBeenCalledTimes(1)
    expect(readVerifier('st1', 'p1')).toBeNull()
    expect(sessionStorage.getItem(RETURN_STASH_KEY)).toBeNull()
  })

  it('waits for the election before adopting a token redeemed first', async () => {
    let release!: () => void
    const loaded = new Promise<void>((resolve) => (release = resolve))
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (String(url).endsWith('/check')) return json({ belongsToProcess: true, questions: [] })
        await loaded
        return json(election)
      })
    )
    verifierFor('st6')
    stash('c6', 'st6')
    const a = api()
    const lateWrapper = ({ children }: { children: ReactNode }) => (
      <TestProvider>
        <ElectionProvider id='p1'>{children}</ElectionProvider>
      </TestProvider>
    )
    const { result } = renderHook(
      () => ({ cert: useCertificateAuth({ processId: 'p1', purpose: 'vote', api: a }), auth: useElectionAuth() }),
      { wrapper: lateWrapper }
    )
    await waitFor(() => expect(a.redeem).toHaveBeenCalledTimes(1))
    await act(async () => {})
    expect(result.current.cert.phase.kind).toBe('checking')
    release()
    await waitFor(() => expect(result.current.cert.phase.kind).toBe('identified'))
    expect(result.current.auth.connected).toBe(true)
    expect(a.redeem).toHaveBeenCalledTimes(1)
  })

  it('treats a missing verifier as a lost session, not an error', async () => {
    stash('c1', 'gone')
    const { result } = renderHook(() => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api() }), {
      wrapper,
    })
    await waitFor(() => expect(result.current.phase).toEqual({ kind: 'idle', resume: true }))
  })

  it('keeps the code on a network drop and redeems it on retry', async () => {
    verifierFor('st2')
    stash('c2', 'st2')
    const redeem = vi
      .fn()
      .mockRejectedValueOnce(new CertAuthError('network'))
      .mockResolvedValueOnce({ purpose: 'vote', authToken: 'tok', voterRef: 'ref', holder, reference: 'r' })
    const { result } = renderHook(
      () => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api({ redeem }) }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.phase.kind).toBe('stalled'))
    expect(readVerifier('st2', 'p1')).not.toBeNull()
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.phase.kind).toBe('identified'))
  })

  it('drops the verifier on a terminal error and keeps its data for V6', async () => {
    verifierFor('st3')
    stash('c3', 'st3')
    const redeem = vi
      .fn()
      .mockRejectedValue(
        new CertAuthError('dni_not_in_census', { holder, reference: '3f9a07c2e41b8d5c2a6f90b3c7e14d28' })
      )
    const { result } = renderHook(
      () => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api({ redeem }) }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.phase.kind).toBe('error'))
    expect(readVerifier('st3', 'p1')).toBeNull()
  })

  it('drops the pending attempt verifier when the auth host returns an error', async () => {
    verifierFor('st7')
    setPending('p1', { state: 'st7', startedAt: Date.now() })
    sessionStorage.setItem(RETURN_STASH_KEY, JSON.stringify({ error: 'no_certificate', at: Date.now() }))
    const { result } = renderHook(() => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api() }), {
      wrapper,
    })
    await waitFor(() => expect(result.current.phase).toMatchObject({ kind: 'error' }))
    expect(readVerifier('st7', 'p1')).toBeNull()
    expect(readPending('p1')).toBeNull()
  })

  it('maps expired, used and mismatched codes to the V1 resume line', async () => {
    verifierFor('st4')
    stash('c4', 'st4')
    const redeem = vi.fn().mockRejectedValue(new CertAuthError('code_used'))
    const { result } = renderHook(
      () => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api({ redeem }) }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.phase).toEqual({ kind: 'idle', resume: true }))
  })

  it('shows the resume line after a manual return with a pending attempt', async () => {
    localStorage.setItem('vocdoni.cert.pending.p1', JSON.stringify({ state: 's', startedAt: Date.now() }))
    const { result } = renderHook(() => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api() }), {
      wrapper,
    })
    await waitFor(() => expect(result.current.phase).toEqual({ kind: 'idle', resume: true }))
    expect(readPending('p1')).toBeNull()
  })

  it('ends a check-only redeem in the checked phase without a session', async () => {
    saveVerifier('st5', { verifier: 'v'.repeat(43), processId: 'p1', purpose: 'check', expiresAt: Date.now() + 60_000 })
    stash('c5', 'st5')
    const redeem = vi.fn(async () => ({
      purpose: 'check' as const,
      authToken: null,
      voterRef: 'ref',
      holder,
      reference: 'r',
    }))
    const { result } = renderHook(
      () => ({
        cert: useCertificateAuth({ processId: 'p1', purpose: 'check', api: api({ redeem }) }),
        auth: useElectionAuth(),
      }),
      { wrapper }
    )
    await waitFor(() => expect(result.current.cert.phase.kind).toBe('checked'))
    expect(result.current.auth.connected).toBe(false)
  })

  it('shows a tokenless vote redeem as a pre-check only while voting has not opened', async () => {
    const upcoming = {
      ...election,
      startDate: new Date(Date.now() + 86_400_000).toISOString(),
      questions: [question('READY')],
    } as unknown as VotingProcessResponse
    verifierFor('st8')
    stash('c8', 'st8')
    const redeem = vi.fn(async () => ({
      purpose: 'vote' as const,
      authToken: null,
      voterRef: 'ref',
      holder,
      reference: 'r',
    }))
    const { result } = renderHook(
      () => useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api({ redeem }) }),
      { wrapper: wrapperFor(upcoming) }
    )
    await waitFor(() => expect(result.current.phase.kind).toBe('checked'))
  })

  it('never reports a tokenless vote redeem after the end as a pre-check success', async () => {
    const ended = { ...election, status: 'ENDED', questions: [question('ENDED')] } as unknown as VotingProcessResponse
    verifierFor('st9')
    stash('c9', 'st9')
    const redeem = vi.fn(async () => ({
      purpose: 'vote' as const,
      authToken: null,
      voterRef: 'ref',
      holder,
      reference: 'r',
    }))
    const { result } = renderHook(
      () => ({
        cert: useCertificateAuth({ processId: 'p1', purpose: 'vote', api: api({ redeem }) }),
        auth: useElectionAuth(),
      }),
      { wrapper: wrapperFor(ended) }
    )
    await waitFor(() => expect(result.current.cert.phase).toEqual({ kind: 'idle' }))
    expect(redeem).toHaveBeenCalledTimes(1)
    expect(result.current.auth.connected).toBe(false)
    expect(readVerifier('st9', 'p1')).toBeNull()
  })
})
