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
})
