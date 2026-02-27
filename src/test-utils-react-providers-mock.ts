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
  useOrganization: () => ({ organization: null }),
  useActions: () => ({ info: null, error: null }),
  useRoutedPagination: () => ({ page: 1, total: 1, limit: 10, setPage: () => undefined }),
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

const resolveMock = (key: string) => (currentMock[key] ?? defaultMock[key]) as any

export const getReactProvidersMock = () => ({
  useClient: (...args: any[]) => resolveMock('useClient')(...args),
  useElection: (...args: any[]) => resolveMock('useElection')(...args),
  useOrganization: (...args: any[]) => resolveMock('useOrganization')(...args),
  useActions: (...args: any[]) => resolveMock('useActions')(...args),
  useRoutedPagination: (...args: any[]) => resolveMock('useRoutedPagination')(...args),
  ElectionProvider: (props: any) => resolveMock('ElectionProvider')(props),
  OrganizationProvider: (props: any) => resolveMock('OrganizationProvider')(props),
})
