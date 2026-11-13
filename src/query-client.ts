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
      },
    },
  })
