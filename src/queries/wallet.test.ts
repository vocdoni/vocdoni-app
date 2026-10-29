import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { isManagedOrgWalletError, useWallet, useWalletTopUp } from './wallet'

const mockGetWallet = vi.fn()
const mockTopUpWallet = vi.fn()
const mockAuth = { currentAddress: undefined as string | undefined }

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    currentAddress: mockAuth.currentAddress,
  }),
}))

vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({
    client: { organizations: { getWallet: mockGetWallet, topUpWallet: mockTopUpWallet } },
  }),
}))

const apiError = (status: number, code: number) => new VocdoniApiError(status, { error: 'boom', code }, 'boom', code)

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
      mockGetWallet.mockResolvedValue({ balanceCents: 500, currency: 'eur', history: [], pagination: {} })

      const { result } = renderHook(() => useWallet({ page: 2, limit: 5 }), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetWallet).toHaveBeenCalledWith('0xabc', { page: 2, limit: 5 })
    })

    it('defaults to the first page of ten entries and prefixes the address with 0x', async () => {
      mockAuth.currentAddress = 'abc'
      mockGetWallet.mockResolvedValue({ balanceCents: 0, currency: 'eur', history: [], pagination: {} })

      const { result } = renderHook(() => useWallet(), { wrapper })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockGetWallet).toHaveBeenCalledWith('0xabc', { page: 1, limit: 10 })
    })

    it('does not fetch without an organization address', async () => {
      mockAuth.currentAddress = undefined

      const { result } = renderHook(() => useWallet(), { wrapper })

      expect(result.current.fetchStatus).toBe('idle')
      expect(mockGetWallet).not.toHaveBeenCalled()
    })

    it('does not retry client errors such as the managed organization one', async () => {
      mockGetWallet.mockRejectedValue(apiError(403, 40181))

      const { result } = renderHook(() => useWallet(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(mockGetWallet).toHaveBeenCalledTimes(1)
    })

    it('retries other errors up to three times', async () => {
      mockGetWallet.mockRejectedValue(apiError(500, 500))

      const { result } = renderHook(() => useWallet(), { wrapper })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(mockGetWallet).toHaveBeenCalledTimes(4)
    })
  })

  describe('useWalletTopUp', () => {
    it('posts the amount, locale and return URL for the selected organization', async () => {
      const response = { clientSecret: 'cs', sessionId: 's', amountCents: 2500, currency: 'eur' }
      mockTopUpWallet.mockResolvedValue(response)

      const { result } = renderHook(() => useWalletTopUp(), { wrapper })
      const data = await result.current.mutateAsync({
        amountCents: 2500,
        locale: 'es',
        returnURL: 'https://app.example/wallet?topup=return',
      })

      expect(data).toEqual(response)
      expect(mockTopUpWallet).toHaveBeenCalledWith('0xabc', {
        amountCents: 2500,
        locale: 'es',
        returnURL: 'https://app.example/wallet?topup=return',
      })
    })
  })

  describe('isManagedOrgWalletError', () => {
    it('is true for the managed organization error code', () => {
      expect(isManagedOrgWalletError(apiError(403, 40181))).toBe(true)
    })

    it('is false for other API errors, plain errors and nothing', () => {
      expect(isManagedOrgWalletError(apiError(400, 40004))).toBe(false)
      expect(isManagedOrgWalletError(new Error('managed'))).toBe(false)
      expect(isManagedOrgWalletError(undefined)).toBe(false)
    })
  })
})
