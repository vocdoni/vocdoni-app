import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { ApiError } from '~components/Auth/api'
import { isManagedOrgWalletError, useWallet, useWalletTopUp } from './wallet'

const mockBearedFetch = vi.fn()
const mockAuth = { currentAddress: undefined as string | undefined }

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: mockBearedFetch,
    currentAddress: mockAuth.currentAddress,
  }),
}))

describe('wallet queries', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.currentAddress = '0xabc'
    queryClient = new QueryClient({
      defaultOptions: { queries: { gcTime: Infinity, retryDelay: 0 }, mutations: { retry: false } },
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)

  describe('useWallet', () => {
    it('fetches the wallet of the selected organization with the page and limit', async () => {
      mockBearedFetch.mockResolvedValue({ balanceCents: 500, currency: 'eur', history: [], pagination: {} })

      const { result } = renderHook(() => useWallet({ page: 2, limit: 5 }), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockBearedFetch).toHaveBeenCalledWith('organizations/0xabc/wallet?page=2&limit=5')
    })

    it('defaults to the first page of ten entries and prefixes the address with 0x', async () => {
      mockAuth.currentAddress = 'abc'
      mockBearedFetch.mockResolvedValue({ balanceCents: 0, currency: 'eur', history: [], pagination: {} })

      const { result } = renderHook(() => useWallet(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockBearedFetch).toHaveBeenCalledWith('organizations/0xabc/wallet?page=1&limit=10')
    })

    it('does not fetch without an organization address', async () => {
      mockAuth.currentAddress = undefined

      const { result } = renderHook(() => useWallet(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(mockBearedFetch).not.toHaveBeenCalled()
    })

    it('does not retry client errors such as the managed organization one', async () => {
      const error = new ApiError({ error: 'managed', code: 40181 }, new Response(null, { status: 403 }))
      mockBearedFetch.mockRejectedValue(error)

      const { result } = renderHook(() => useWallet(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(mockBearedFetch).toHaveBeenCalledTimes(1)
    })

    it('retries other errors up to three times', async () => {
      mockBearedFetch.mockRejectedValue(new ApiError({ error: 'boom', code: 500 }))

      const { result } = renderHook(() => useWallet(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(mockBearedFetch).toHaveBeenCalledTimes(4)
    })
  })

  describe('useWalletTopUp', () => {
    it('posts the amount and locale to the top-up endpoint', async () => {
      const response = { clientSecret: 'cs', sessionId: 's', amountCents: 2500, currency: 'eur' }
      mockBearedFetch.mockResolvedValue(response)

      const { result } = renderHook(() => useWalletTopUp(), { wrapper })
      const data = await result.current.mutateAsync({ amountCents: 2500, locale: 'es' })

      expect(data).toEqual(response)
      expect(mockBearedFetch).toHaveBeenCalledWith('organizations/0xabc/wallet/topup', {
        method: 'POST',
        body: { amountCents: 2500, locale: 'es' },
      })
    })
  })

  describe('isManagedOrgWalletError', () => {
    it('is true for the managed organization error code', () => {
      expect(isManagedOrgWalletError(new ApiError({ error: 'managed', code: 40181 }))).toBe(true)
    })

    it('is false for other API errors, plain errors and nothing', () => {
      expect(isManagedOrgWalletError(new ApiError({ error: 'other', code: 40004 }))).toBe(false)
      expect(isManagedOrgWalletError(new Error('managed'))).toBe(false)
      expect(isManagedOrgWalletError(undefined)).toBe(false)
    })
  })
})
