import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UnauthorizedApiError } from '~platform/api/client'
import { AuthProvider } from '~platform/auth/AuthContext'
import { OrgProvider } from '~platform/auth/OrgContext'
import { Toaster } from '~platform/components/ui/toaster'
import { AppRouter } from '~platform/Router'
import { Theme } from '~platform/Theme'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Auth failures won't fix themselves; don't hammer the API.
        if (error instanceof UnauthorizedApiError) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
  },
})

export const Providers = () => (
  <Theme>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrgProvider>
          <AppRouter />
        </OrgProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  </Theme>
)
