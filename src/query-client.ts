import { QueryClient } from '@tanstack/react-query'
import { UnauthorizedApiError } from '~components/Auth/api'

export const createAppQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof UnauthorizedApiError) return false
          return failureCount < 3
        },
        refetchOnWindowFocus: false,
        // A revisited screen renders from cache and refreshes in the background. Reads that must be
        // current on mount (balances, payments, jobs) opt out with their own `staleTime: 0`.
        staleTime: 30_000,
      },
    },
  })
