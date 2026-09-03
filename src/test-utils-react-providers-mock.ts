import type { ReactNode } from 'react'

type ReactProvidersMock = Record<string, any>

const defaultMock: ReactProvidersMock = {
  useClient: () => ({
    connected: false,
    account: null,
    client: {},
    fetchAccount: () => undefined,
    errors: { fetch: null },
    loading: { fetch: false, account: false },
    loaded: { account: true },
  }),
  useElection: () => ({ election: null, connected: false, loading: {}, errors: {} }),
  useElectionAuth: () => ({ connected: false, authToken: null, weight: null }),
  useOrganization: () => ({ organization: null }),
  useActions: () => ({ info: null, error: null }),
  usePagination: () => ({ page: 1, total: 1, limit: 10, setPage: () => undefined }),
  useRoutedPagination: () => ({ page: 1, total: 1, limit: 10, setPage: () => undefined }),
  PaginationProvider: ({ children }: { children: ReactNode }) => children as any,
  RoutedPaginationProvider: ({ children }: { children: ReactNode }) => children as any,
  ElectionProvider: ({ children }: { children: ReactNode }) => children as any,
  OrganizationProvider: ({ children }: { children: ReactNode }) => children as any,
}

let currentMock: ReactProvidersMock = { ...defaultMock }

export const setReactProvidersMock = (overrides: ReactProvidersMock) => {
  currentMock = { ...currentMock, ...overrides }
}

export const resetReactProvidersMock = () => {
  currentMock = { ...defaultMock }
}

// --- App auth hook (~components/Auth/useAuth) --------------------------------------
// Mirrors the react-components mock so component tests can set the active org address
// and auth state without wiring the whole AuthProvider tree.
const defaultAuthMock: Record<string, any> = {
  isAuthenticated: false,
  bearer: null,
  expiry: null,
  currentAddress: undefined,
  addresses: [],
  isAuthLoading: false,
  login: { mutateAsync: () => Promise.resolve(), isPending: false, reset: () => undefined },
  register: { mutateAsync: () => Promise.resolve() },
  mailVerify: { mutateAsync: () => Promise.resolve() },
  logout: () => undefined,
  bearedFetch: () => Promise.resolve(undefined),
  refreshAddresses: () => Promise.resolve(),
  setSession: () => undefined,
}

let currentAuthMock: Record<string, any> = { ...defaultAuthMock }

export const setAuthMock = (overrides: Record<string, any>) => {
  currentAuthMock = { ...currentAuthMock, ...overrides }
}

export const resetAuthMock = () => {
  currentAuthMock = { ...defaultAuthMock }
}

export const getAuthMock = () => currentAuthMock

const resolveMock = (key: string) => (currentMock[key] ?? defaultMock[key]) as any

export const getReactProvidersMock = () => ({
  useClient: (...args: any[]) => resolveMock('useClient')(...args),
  useElection: (...args: any[]) => resolveMock('useElection')(...args),
  useElectionAuth: (...args: any[]) => resolveMock('useElectionAuth')(...args),
  useOrganization: (...args: any[]) => resolveMock('useOrganization')(...args),
  useActions: (...args: any[]) => resolveMock('useActions')(...args),
  usePagination: (...args: any[]) => resolveMock('usePagination')(...args),
  useRoutedPagination: (...args: any[]) => resolveMock('useRoutedPagination')(...args),
  PaginationProvider: (props: any) => resolveMock('PaginationProvider')(props),
  RoutedPaginationProvider: (props: any) => resolveMock('RoutedPaginationProvider')(props),
  ElectionProvider: (props: any) => resolveMock('ElectionProvider')(props),
  OrganizationProvider: (props: any) => resolveMock('OrganizationProvider')(props),
})
