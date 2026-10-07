import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { AllProviders } from '~src/test-utils'
import { CspCooldownError, useCountdown, useCspAuth0, useCspAuth1, useCspAuthPending } from './basics'

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
  requestsOnCooldown: 'Too many requests. Please wait a moment before trying again.',
  zeroVotingWeight: "You don't have enough voting power to access the election.",
}

const mockAuthError = (code: number, error = 'server error', data?: unknown) => {
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

  it('maps 40103 to requests on cooldown message', async () => {
    mockAuthError(40103)
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    const error = await result.current.mutateAsync({}).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(CspCooldownError)
    expect((error as CspCooldownError).message).toBe(messages.requestsOnCooldown)
    expect((error as CspCooldownError).retryAfterMs).toBeUndefined()
  })

  it('maps 40103 with the wait left to a countdown message', async () => {
    mockAuthError(40103, 'attempt cooldown time not reached', { coolDownTime: 41_200 })
    const { result } = renderHook(() => useCspAuth0(), { wrapper: AllProviders })

    const error = await result.current.mutateAsync({}).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(CspCooldownError)
    expect((error as CspCooldownError).message).toBe('You can request a new code in 42 s.')
    expect((error as CspCooldownError).retryAfterMs).toBe(41_200)
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

describe('useCountdown', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts the seconds left down to zero', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCountdown())
    expect(result.current.secondsLeft).toBe(0)

    act(() => result.current.start(2_500))
    expect(result.current.secondsLeft).toBe(3)

    act(() => vi.advanceTimersByTime(1_000))
    expect(result.current.secondsLeft).toBe(2)

    act(() => vi.advanceTimersByTime(2_000))
    expect(result.current.secondsLeft).toBe(0)
  })
})
