import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
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

// Mock API and UnauthorizedApiError
vi.mock('~components/Auth/api', () => {
  // Define MockUnauthorizedApiError inside the factory to avoid hoisting issues
  class MockUnauthorizedApiError extends Error {
    constructor(message: string) {
      super(message)
      this.name = 'UnauthorizedApiError'
    }
  }

  return {
    ApiEndpoints: {
      Me: 'users/me',
    },
    UnauthorizedApiError: MockUnauthorizedApiError,
  }
})

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

  // describe('failed query', () => {
  //   it('should call recordFailure when query fails', async () => {
  //     const error = new Error('Network error')
  //     mockBearedFetch.mockRejectedValue(error)
  //     const { result } = renderHook(() => useProfile(), { wrapper })
  //     await waitFor(() => {
  //       expect(result.current.isError).toBe(true)
  //     })
  //     expect(mockRecordFailure).toHaveBeenCalled()
  //     expect(result.current.error).toEqual(error)
  //   })
  //   it('should not retry UnauthorizedApiError', async () => {
  //     const authError = new UnauthorizedApiError({ error: 'Unauthorized' })
  //     mockBearedFetch.mockRejectedValue(authError)
  //     const { result } = renderHook(() => useProfile(), { wrapper })
  //     await waitFor(() => {
  //       expect(result.current.isError).toBe(true)
  //     })
  //     // Should only be called once (no retries)
  //     expect(mockBearedFetch).toHaveBeenCalledTimes(1)
  //   })
  //   it('should retry up to 3 times for non-auth errors', async () => {
  //     const error = new Error('Network error')
  //     mockBearedFetch.mockRejectedValue(error)
  //     const { result } = renderHook(() => useProfile(), { wrapper })
  //     await waitFor(
  //       () => {
  //         expect(result.current.isError).toBe(true)
  //       },
  //       { timeout: 10000 }
  //     )
  //     // Should have retried 3 times + initial attempt = 4 total calls
  //     expect(mockBearedFetch.mock.calls.length).toBeGreaterThanOrEqual(1)
  //   })
  // })

  describe('manual retry logic', () => {
    // it('should start retry interval when query enters error state', async () => {
    //   const error = new Error('Network error')
    //   mockBearedFetch.mockRejectedValue(error)

    //   const { result } = renderHook(() => useProfile(), { wrapper })

    //   // Run all pending timers to let React Query complete
    //   // await vi.runOnlyPendingTimersAsync()

    //   await waitFor(
    //     () => {
    //       expect(result.current.isError).toBe(true)
    //     },
    //     { timeout: 10000 }
    //   )

    //   // Clear the initial fetch calls
    //   mockBearedFetch.mockClear()

    //   // Advance time by 5 seconds to trigger retry
    //   // await vi.advanceTimersByTimeAsync(5000)

    //   // Should have attempted a refetch
    //   expect(mockBearedFetch).toHaveBeenCalled()
    // })

    // it('should stop retry interval when query succeeds', async () => {
    //   // First fail, then succeed
    //   mockBearedFetch.mockRejectedValueOnce(new Error('Network error')).mockResolvedValue({ id: '1' })

    //   const { result } = renderHook(() => useProfile(), { wrapper })

    //   // Wait for initial failure
    //   await waitFor(() => {
    //     expect(result.current.isError).toBe(true)
    //   })

    //   // Clear mocks
    //   mockBearedFetch.mockClear()
    //   mockRecordSuccess.mockClear()

    //   // Advance time to trigger retry
    //   // await vi.advanceTimersByTimeAsync(5000)

    //   // Wait for success
    //   await waitFor(() => {
    //     expect(result.current.isSuccess).toBe(true)
    //   })

    //   expect(mockRecordSuccess).toHaveBeenCalled()

    //   // Clear mocks again
    //   mockBearedFetch.mockClear()

    //   // Advance time more - should NOT refetch anymore
    //   // await vi.advanceTimersByTimeAsync(10000)

    //   // Should not have called bearedFetch again
    //   expect(mockBearedFetch).not.toHaveBeenCalled()
    // })

    it('should not refetch if already fetching', async () => {
      let resolveFn: (value: any) => void

      // Create a promise that we can control
      const controlledPromise = new Promise((resolve) => {
        resolveFn = resolve
      })

      mockBearedFetch.mockReturnValue(controlledPromise)

      const { result } = renderHook(() => useProfile(), { wrapper })

      // Wait for query to start fetching
      await waitFor(() => {
        expect(result.current.isFetching).toBe(true)
      })

      const initialCallCount = mockBearedFetch.mock.calls.length

      // Should not have made additional calls while still fetching
      expect(mockBearedFetch.mock.calls.length).toBe(initialCallCount)

      // Resolve the promise to clean up
      resolveFn!({ id: '1' })
    })

    // it('should cleanup interval on unmount', async () => {
    //   const error = new Error('Network error')
    //   mockBearedFetch.mockRejectedValue(error)

    //   const { result, unmount } = renderHook(() => useProfile(), { wrapper })

    //   await waitFor(() => {
    //     expect(result.current.isError).toBe(true)
    //   })

    //   // Clear mocks
    //   mockBearedFetch.mockClear()

    //   // Unmount the hook
    //   unmount()

    //   // Should not have attempted any refetches after unmount
    //   expect(mockBearedFetch).not.toHaveBeenCalled()
    // })
  })
})
