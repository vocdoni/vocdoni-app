import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { ApiError, UnauthorizedApiError } from '~components/Auth/api'
import { useProfile } from './account'

// Define mock functions before vi.mock (Vitest hoists vi.mock but not the variables)
const mockBearedFetch = vi.fn()
const mockRecordFailure = vi.fn()
const mockRecordSuccess = vi.fn()

// Mock the auth hook
vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: mockBearedFetch,
  }),
}))

// Mock the connection toast hook
vi.mock('~components/Layout/ConnectionToast', () => ({
  useConnectionToast: () => ({
    recordFailure: mockRecordFailure,
    recordSuccess: mockRecordSuccess,
  }),
  ConnectionToastProvider: ({ children }: { children: ReactNode }) => children,
}))

describe('useProfile', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          gcTime: Infinity,
          retryDelay: 0,
        },
      },
    })
  })

  afterEach(() => {
    queryClient.clear()
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  describe('successful query', () => {
    it('should fetch profile data successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        organizations: [],
      }

      mockBearedFetch.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(mockBearedFetch).toHaveBeenCalledWith('users/me')
    })

    it('should call recordSuccess when query succeeds', async () => {
      mockBearedFetch.mockResolvedValue({ id: '1' })

      const { result } = renderHook(() => useProfile(), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(mockRecordSuccess).toHaveBeenCalled()
    })
  })

  // The query gives up after its own retries; while the failure looks like lost
  // connectivity the hook keeps polling every 5s so the app recovers by itself.
  describe('connection recovery', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    const failedProfile = async (error: Error) => {
      mockBearedFetch.mockRejectedValue(error)
      const hook = renderHook(() => useProfile(), { wrapper })
      await waitFor(() => expect(hook.result.current.isError).toBe(true))
      mockBearedFetch.mockClear()
      return hook
    }

    it('keeps retrying a network failure until the profile loads', async () => {
      const { result } = await failedProfile(new TypeError('Failed to fetch'))
      expect(mockRecordFailure).toHaveBeenCalled()

      mockBearedFetch.mockResolvedValue({ id: '1' })
      await act(() => vi.advanceTimersByTimeAsync(5_000))

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(mockBearedFetch).toHaveBeenCalledTimes(1)
      expect(mockRecordSuccess).toHaveBeenCalled()

      // Recovered: the polling stops.
      await act(() => vi.advanceTimersByTimeAsync(15_000))
      expect(mockBearedFetch).toHaveBeenCalledTimes(1)
    })

    it('does not poll for errors the server actually answered', async () => {
      await failedProfile(new ApiError({ error: 'boom' } as any, { status: 500 } as Response))
      expect(mockRecordFailure).not.toHaveBeenCalled()
      expect(mockRecordSuccess).toHaveBeenCalled()

      await act(() => vi.advanceTimersByTimeAsync(15_000))
      expect(mockBearedFetch).not.toHaveBeenCalled()
    })

    it('does not poll for an expired session', async () => {
      await failedProfile(new UnauthorizedApiError({ error: 'Unauthorized' } as any, { status: 401 } as Response))

      await act(() => vi.advanceTimersByTimeAsync(15_000))
      expect(mockBearedFetch).not.toHaveBeenCalled()
    })

    it('stops polling once unmounted', async () => {
      const { unmount } = await failedProfile(new TypeError('Failed to fetch'))

      unmount()
      await act(() => vi.advanceTimersByTimeAsync(15_000))
      expect(mockBearedFetch).not.toHaveBeenCalled()
    })
  })
})
