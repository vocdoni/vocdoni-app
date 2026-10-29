import { ApiErrorCode, VocdoniApiError } from '@vocdoni/api-client'
import type { WalletLedgerEntry } from '@vocdoni/api-types'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { censusPaymentIds, useCensusCheckout, useReadWalletHistory, waitForCensusPayment } from './census-checkout'

const mockCensusCheckout = vi.hoisted(() => vi.fn())
const mockGetWallet = vi.hoisted(() => vi.fn())

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0x1234' }),
}))

vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({
    client: { elections: { censusCheckout: mockCensusCheckout }, organizations: { getWallet: mockGetWallet } },
  }),
}))

const processId = '6650f0c0c0c0c0c0c0c0c0c0'

const queryClient = new QueryClient()
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(QueryClientProvider, { client: queryClient }, children)

const entry = (overrides: Partial<WalletLedgerEntry>): WalletLedgerEntry => ({
  id: 'e1',
  orgAddress: '0x1234',
  amountCents: -500,
  kind: 'payment',
  processId,
  createdAt: '2026-10-01T10:00:00Z',
  ...overrides,
})

// A clock that only moves when the poller sleeps, so the time limit is exact and instant
const fakeClock = () => {
  let time = 0
  const sleeps: number[] = []
  return {
    sleeps,
    now: () => time,
    sleep: async (ms: number) => {
      sleeps.push(ms)
      time += ms
    },
  }
}

describe('useCensusCheckout', () => {
  beforeEach(() => {
    mockCensusCheckout.mockReset()
  })

  it('buys the census room through the SDK, with the locale and the return URL', async () => {
    mockCensusCheckout.mockResolvedValue({ amountCents: 500, currency: 'eur', clientSecret: '', sessionId: '' })
    const { result } = renderHook(() => useCensusCheckout(), { wrapper })

    result.current.mutate({ processId, censusSize: 1200, locale: 'es', returnURL: 'https://app.test/return' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockCensusCheckout).toHaveBeenCalledWith(processId, {
      censusSize: 1200,
      locale: 'es',
      returnURL: 'https://app.test/return',
    })
  })

  it('refuses a process id that is not one, before any request', async () => {
    const { result } = renderHook(() => useCensusCheckout(), { wrapper })

    result.current.mutate({ processId: 'processes/x/../../wallet', censusSize: 10, returnURL: 'https://app.test' })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(mockCensusCheckout).not.toHaveBeenCalled()
  })

  it('surfaces the refusal of the backend', async () => {
    const refusal = new VocdoniApiError(
      402,
      { error: 'no room', code: ApiErrorCode.SpendCapReached },
      'no room',
      ApiErrorCode.SpendCapReached
    )
    mockCensusCheckout.mockRejectedValue(refusal)
    const { result } = renderHook(() => useCensusCheckout(), { wrapper })

    result.current.mutate({ processId, censusSize: 10, returnURL: 'https://app.test' })

    await waitFor(() => expect(result.current.error).toBe(refusal))
  })
})

describe('useReadWalletHistory', () => {
  beforeEach(() => {
    mockGetWallet.mockReset()
  })

  it('reads the first page of the ledger of the selected organization', async () => {
    mockGetWallet.mockResolvedValue({ balanceCents: 0, currency: 'eur', history: [entry({ id: 'h1' })] })
    const { result } = renderHook(() => useReadWalletHistory(), { wrapper })

    await expect(result.current()).resolves.toEqual([entry({ id: 'h1' })])
    expect(mockGetWallet).toHaveBeenCalledWith('0x1234', { page: 1, limit: 10 })
  })
})

describe('censusPaymentIds', () => {
  it('lists the payments of the process only', () => {
    const history = [
      entry({ id: 'p1' }),
      entry({ id: 'p2', processId: '6650f0c0c0c0c0c0c0c0c0c1' }),
      entry({ id: 't1', kind: 'topup', amountCents: 5000, processId: undefined }),
    ]

    expect(censusPaymentIds(history, processId)).toEqual(['p1'])
  })
})

describe('waitForCensusPayment', () => {
  it('resolves with the new payment once it appears in the ledger', async () => {
    const clock = fakeClock()
    const readHistory = vi
      .fn()
      .mockResolvedValueOnce([entry({ id: 'old' })])
      .mockResolvedValueOnce([entry({ id: 'old' })])
      .mockResolvedValueOnce([entry({ id: 'new', amountCents: -1200 }), entry({ id: 'old' })])

    const outcome = await waitForCensusPayment(readHistory, processId, ['old'], clock)

    expect(outcome).toEqual({ status: 'paid', entry: expect.objectContaining({ id: 'new', amountCents: -1200 }) })
    expect(readHistory).toHaveBeenCalledTimes(3)
  })

  it('ignores payments of other processes and debits that are not payments', async () => {
    const clock = fakeClock()
    const readHistory = vi
      .fn()
      .mockResolvedValueOnce([
        entry({ id: 'other', processId: '6650f0c0c0c0c0c0c0c0c0c1' }),
        entry({ id: 'refund', kind: 'refund' }),
      ])
      .mockResolvedValueOnce([entry({ id: 'mine' })])

    const outcome = await waitForCensusPayment(readHistory, processId, [], clock)

    expect(outcome).toEqual({ status: 'paid', entry: expect.objectContaining({ id: 'mine' }) })
    expect(readHistory).toHaveBeenCalledTimes(2)
  })

  it('backs off from 2 s up to 10 s', async () => {
    const clock = fakeClock()
    const readHistory = vi.fn().mockResolvedValue([])

    await waitForCensusPayment(readHistory, processId, [], { ...clock, timeoutMs: 60_000 })

    expect(clock.sleeps.slice(0, 5)).toEqual([2000, 3000, 4500, 6750, 10000])
    expect(Math.max(...clock.sleeps)).toBe(10000)
  })

  it('times out after two minutes without a payment', async () => {
    const clock = fakeClock()
    const readHistory = vi.fn().mockResolvedValue([])

    const outcome = await waitForCensusPayment(readHistory, processId, [], clock)

    expect(outcome).toEqual({ status: 'timeout' })
    expect(clock.now()).toBeLessThanOrEqual(2 * 60 * 1000)
    expect(clock.now()).toBeGreaterThan(2 * 60 * 1000 - 10000)
  })

  it('keeps polling through a failed read', async () => {
    const clock = fakeClock()
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const readHistory = vi
      .fn()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce([entry({ id: 'new' })])

    const outcome = await waitForCensusPayment(readHistory, processId, [], clock)

    expect(outcome).toEqual({ status: 'paid', entry: expect.objectContaining({ id: 'new' }) })
  })

  it('stops at once on a permanent refusal of the wallet', async () => {
    const clock = fakeClock()
    const readHistory = vi.fn().mockRejectedValue(new VocdoniApiError(403, { error: 'forbidden' }, 'forbidden'))

    await expect(waitForCensusPayment(readHistory, processId, [], clock)).rejects.toThrow('forbidden')
    expect(readHistory).toHaveBeenCalledTimes(1)
  })

  it('resolves to undefined when aborted', async () => {
    const controller = new AbortController()
    const readHistory = vi.fn().mockImplementation(async () => {
      controller.abort()
      return []
    })

    const outcome = await waitForCensusPayment(readHistory, processId, [], {
      signal: controller.signal,
      sleep: async () => undefined,
    })

    expect(outcome).toBeUndefined()
    expect(readHistory).toHaveBeenCalledTimes(1)
  })
})
