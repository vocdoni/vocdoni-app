import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import i18n from 'i18next'
import { ReactElement, ReactNode } from 'react'
import { I18nextProvider } from 'react-i18next'
import { ConnectionToastProvider } from '~components/shared/Layout/ConnectionToast'
import { ToastProvider } from '~shared/Toast'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'

// Initialize i18n for tests
i18n.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        'connection.error_title': 'Connection issues detected',
        'connection.error_description': 'Unable to reach the server. Please check your connection.',
        'connection.restored_title': 'Connection restored',
        'connection.restored_description': 'You are back online.',
      },
    },
  },
})

// Create a test QueryClient with retries disabled for faster tests
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: Infinity,
        retryDelay: 0,
      },
    },
  })

interface AllProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
}

// Wrapper component with all providers needed for tests
export function AllProviders({ children, queryClient = createTestQueryClient() }: AllProvidersProps) {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <ToastProvider>
              <ConnectionToastProvider>{children}</ConnectionToastProvider>
            </ToastProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </ChakraProvider>
    </ColorModeProvider>
  )
}

// Custom render function that includes all providers
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  const queryClient = createTestQueryClient()

  return {
    ...render(ui, {
      wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
      ...options,
    }),
    queryClient,
  }
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
