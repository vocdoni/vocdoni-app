import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { AllProviders } from '~src/test-utils'
import { CspAuthProvider } from './CSPStepsProvider'
import { KnownCspError, translateCspError, useCspAuth0, useCspAuth1, useCspAuthPending } from './basics'

const { auth0, auth1 } = vi.hoisted(() => ({ auth0: vi.fn(), auth1: vi.fn() }))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  return {
    ...actual,
    useElectionAuth: () => ({ auth0, auth1 }),
  }
})

const messages = {
  participantNotFound: 'The voter is not listed in the census, or the provided credentials are incorrect.',
  credentialsOrPassword: "We couldn't verify your identity. Check your credentials and your password and try again.",
  requestsOnCooldown: 'Too many requests. Please wait a moment before trying again.',
  zeroVotingWeight: "You don't have enough voting power to access the election.",
  tooManyAttempts: 'Too many attempts. Please try again later.',
  tooManyAttemptsMinutes: 'Too many attempts. Please try again in 2 minutes.',
  tooManyAttemptsHours: 'Too many attempts. Please try again in 2 hours.',
}

const mockAuthError = (code: number, error = 'server error', data?: Record<string, unknown>) => {
  auth0.mockRejectedValue(new VocdoniApiError(400, { code, error, data }, error, code))
}

beforeEach(() => {
  auth0.mockReset()
  auth1.mockReset()
})

describe('useCspAuth0 errors', () => {
  it('maps 40029 to participant not found message', async () => {
    mockAuthError(40029)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.participantNotFound)
  })

  it('maps 40802 to participant not found message', async () => {
    mockAuthError(40802)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.participantNotFound)
  })

  it.each([40029, 40802])('maps %i to the password-aware message when the census asks for a password', async (code) => {
    mockAuthError(code)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders>
        <CspAuthProvider censusData={{ authFields: ['memberNumber', 'password'], twoFaFields: [] }}>
          {children}
        </CspAuthProvider>
      </AllProviders>
    )
    const { result } = renderHook(() => useCspAuth0(), { wrapper })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.credentialsOrPassword)
  })

  it('keeps the participant not found message when the census has no password', async () => {
    mockAuthError(40029)
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders>
        <CspAuthProvider censusData={{ authFields: ['memberNumber'], twoFaFields: [] }}>{children}</CspAuthProvider>
      </AllProviders>
    )
    const { result } = renderHook(() => useCspAuth0(), { wrapper })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.participantNotFound)
  })

  it('maps 40017 with retryAfter under an hour to a minutes message', async () => {
    mockAuthError(40017, 'max attempts', { retryAfter: 90 })
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.tooManyAttemptsMinutes)
  })

  it('maps 40017 with retryAfter of an hour or more to an hours message', async () => {
    mockAuthError(40017, 'max attempts', { retryAfter: 7200 })
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.tooManyAttemptsHours)
  })

  it('maps 40017 without retryAfter to a generic message', async () => {
    mockAuthError(40017, 'max attempts')
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.tooManyAttempts)
  })

  it('maps 40103 to requests on cooldown message', async () => {
    mockAuthError(40103)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.requestsOnCooldown)
  })

  it('maps 40801 to zero voting weight message', async () => {
    mockAuthError(40801)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow(messages.zeroVotingWeight)
  })

  it('keeps the API message for unmapped codes', async () => {
    mockAuthError(50000, 'unexpected failure')
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow('unexpected failure')
  })
})

describe('translateCspError', () => {
  const t = ((key: string) => key) as never
  const apiError = (code: number, data?: Record<string, unknown>) =>
    new VocdoniApiError(400, { code, error: 'server error', data }, 'server error', code)

  it.each([
    [40029, 'csp.errors.participant_not_found'],
    [40802, 'csp.errors.participant_not_found'],
    [40017, 'csp.errors.too_many_attempts'],
    [40103, 'csp.errors.requests_on_cooldown'],
    [40801, 'csp.errors.zero_voting_weight'],
  ])('says it recognised %i', (code, message) => {
    expect(translateCspError(apiError(code), t)).toEqual({ message, known: true })
  })

  it('words a failed match without blaming a field when the census asks for a password', () => {
    expect(translateCspError(apiError(40802), t, { hasPassword: true })).toEqual({
      message: 'csp.errors.credentials_or_password_incorrect',
      known: true,
    })
  })

  it('keeps the raw message of anything else and says it did not recognise it', () => {
    expect(translateCspError(apiError(50000), t)).toEqual({ message: 'server error', known: false })
    expect(translateCspError(new TypeError('fetch failed'), t)).toEqual({ message: 'fetch failed', known: false })
    expect(translateCspError('boom', t)).toEqual({ message: 'boom', known: false })
  })

  it('makes the mutations throw a recognised refusal as a KnownCspError and pass anything else on', async () => {
    mockAuthError(40103)
    const known = renderHook(() => useCspAuth0(), { wrapper: AllProviders })
    await expect(known.result.current.mutateAsync({})).rejects.toBeInstanceOf(KnownCspError)
    const raw = new TypeError('fetch failed')
    auth0.mockRejectedValue(raw)
    const other = renderHook(() => useCspAuth0(), { wrapper: AllProviders })
    await expect(other.result.current.mutateAsync({})).rejects.toBe(raw)
  })
})

describe('useCspAuthPending', () => {
  it('stays pending after the dialog that submitted the code unmounts', async () => {
    let resolve!: () => void
    auth1.mockReturnValue(new Promise<void>((r) => (resolve = r)))
    const client = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const submitter = renderHook(() => useCspAuth1(), { wrapper })
    const other = renderHook(() => useCspAuthPending(), { wrapper })

    act(() => {
      void submitter.result.current.mutateAsync('123456')
    })
    submitter.unmount()

    await waitFor(() => expect(other.result.current).toBe(true))

    await act(async () => resolve())
    await waitFor(() => expect(other.result.current).toBe(false))
  })

  it('also covers an identify request sent from a dialog that was closed', async () => {
    let resolve!: () => void
    auth0.mockReturnValue(new Promise<void>((r) => (resolve = r)))
    const client = new QueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    )

    const submitter = renderHook(() => useCspAuth0(), { wrapper })
    const other = renderHook(() => useCspAuthPending(), { wrapper })

    act(() => {
      void submitter.result.current.mutateAsync({ memberNumber: '1' })
    })
    submitter.unmount()

    await waitFor(() => expect(other.result.current).toBe(true))

    await act(async () => resolve())
    await waitFor(() => expect(other.result.current).toBe(false))
  })
})
