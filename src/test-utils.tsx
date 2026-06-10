import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, RenderOptions } from '@testing-library/react'
import { ComponentsProvider, ConfirmProvider } from '@vocdoni/react-components'
import i18n, { type Resource } from 'i18next'
import { ComponentType, ReactElement, ReactNode } from 'react'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import {
  createMemoryRouter,
  MemoryRouter,
  RouterProvider,
  type MemoryRouterProps,
  type RouteObject,
  type RouterProviderProps,
} from 'react-router-dom'
import { ConnectionToastProvider } from '~components/Layout/ConnectionToast'
import { ToastProvider as BaseToastProvider } from '~components/Toast'
import { AppEnvProvider } from '~src/app-env'
import { buildAppEnv, type AppEnv } from '~src/app-env-build'
import { ColorModeProvider } from '~theme/color-mode'
import { uiScaffoldComponents } from '~theme/react-components'
import { system } from '~theme/system'

type TestI18nOptions = {
  resources: Resource
  lng?: string
  fallbackLng?: string
  useReactI18next?: boolean
}

export async function createTestI18n({
  resources,
  lng = 'en',
  fallbackLng = 'en',
  useReactI18next = false,
}: TestI18nOptions) {
  const instance = i18n.createInstance()

  if (useReactI18next) {
    instance.use(initReactI18next)
  }

  await instance.init({
    lng,
    fallbackLng,
    defaultNS: 'common',
    showSupportNotice: false,
    interpolation: { escapeValue: false },
    resources,
  })

  return instance
}

// Initialize i18n for tests
i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  showSupportNotice: false,
  resources: {
    en: {
      common: {
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

export const mockUseClient = (overrides: Record<string, unknown> = {}) => ({
  connected: false,
  account: null,
  client: {},
  ...overrides,
})

export const mockUseElection = (overrides: Record<string, unknown> = {}) => ({
  election: null,
  connected: false,
  loading: {},
  errors: {},
  ...overrides,
})

export const mockUseOrganization = (overrides: Record<string, unknown> = {}) => ({
  organization: null,
  ...overrides,
})

export const withReactProvidersMocks = (overrides?: {
  useClient?: Record<string, unknown>
  useElection?: Record<string, unknown>
  useOrganization?: Record<string, unknown>
}) => ({
  useClient: () => mockUseClient(overrides?.useClient),
  useElection: () => mockUseElection(overrides?.useElection),
  useOrganization: () => mockUseOrganization(overrides?.useOrganization),
})

interface AllProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
  i18nInstance?: typeof i18n
  innerWrapper?: ComponentType<{ children: ReactNode }>
  appEnv?: Partial<AppEnv>
}

const TestToastProvider = ({ children }: { children: ReactNode }) => {
  const ToastProvider =
    BaseToastProvider ?? (({ children: innerChildren }: { children: ReactNode }) => <>{innerChildren}</>)
  return <ToastProvider>{children}</ToastProvider>
}

// Wrapper component with all providers needed for tests
export function AllProviders({
  children,
  queryClient = createTestQueryClient(),
  i18nInstance = i18n,
  innerWrapper: InnerWrapper,
  appEnv,
}: AllProvidersProps) {
  const content = InnerWrapper ? <InnerWrapper>{children}</InnerWrapper> : children
  const env: AppEnv = { ...buildAppEnv({}), ...appEnv }

  return (
    <AppEnvProvider value={env}>
      <ColorModeProvider>
        <ChakraProvider value={system}>
          <I18nextProvider i18n={i18nInstance}>
            <QueryClientProvider client={queryClient}>
              <TestToastProvider>
                <ComponentsProvider components={uiScaffoldComponents}>
                  <ConfirmProvider>
                    <ConnectionToastProvider>{content}</ConnectionToastProvider>
                  </ConfirmProvider>
                </ComponentsProvider>
              </TestToastProvider>
            </QueryClientProvider>
          </I18nextProvider>
        </ChakraProvider>
      </ColorModeProvider>
    </AppEnvProvider>
  )
}

// Custom render function that includes all providers
type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient
  i18nInstance?: typeof i18n
  wrapper?: ComponentType<{ children: ReactNode }>
  appEnv?: Partial<AppEnv>
}

export function renderWithProviders(ui: ReactElement, options?: RenderWithProvidersOptions) {
  const { queryClient = createTestQueryClient(), i18nInstance, wrapper, appEnv, ...renderOptions } = options ?? {}

  return {
    ...render(ui, {
      wrapper: ({ children }) => (
        <AllProviders queryClient={queryClient} i18nInstance={i18nInstance} innerWrapper={wrapper} appEnv={appEnv}>
          {children}
        </AllProviders>
      ),
      ...renderOptions,
    }),
    queryClient,
  }
}

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

export function createTestMemoryRouter(routes: RouteObject[], opts?: Parameters<typeof createMemoryRouter>[1]) {
  return createMemoryRouter(routes, {
    ...opts,
    future: { v7_relativeSplatPath: true, ...opts?.future },
  })
}

export function TestRouterProvider({ future, ...props }: RouterProviderProps) {
  return <RouterProvider {...props} future={{ v7_startTransition: true, ...future }} />
}

export function TestMemoryRouter({ children, future, ...props }: MemoryRouterProps) {
  return (
    <MemoryRouter {...props} future={{ ...routerFutureFlags, ...future }}>
      {children}
    </MemoryRouter>
  )
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }
