import { renderHook, waitFor } from '@testing-library/react'
import { AllProviders, createTestQueryClient } from '~src/test-utils'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useOrganizationMeta, usePrefetchOrganization } from './organization'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

const getOrganization = vi.fn()
vi.mock('~src/providers/ApiClientProvider', async () => {
  const { ClientProvider } =
    await vi.importActual<typeof import('@vocdoni/react-providers')>('@vocdoni/react-providers')
  return {
    ApiClientProvider: ({ children }: { children: React.ReactNode }) => (
      <ClientProvider apiUrl='http://test.local'>{children}</ClientProvider>
    ),
    AUTH_STORAGE_KEY: 'auth',
    useApiClient: () => ({ client: { organizations: { get: getOrganization } } }),
  }
})

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

const bearedFetch = vi.fn()

describe('useOrganizationMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    bearedFetch.mockResolvedValue({ meta: { isSidebarTutorialClosed: true } })
  })

  it('reads the meta as soon as the session address is known, without waiting for the organization', async () => {
    setAuthMock({ currentAddress: '0xorg', bearedFetch })
    setReactProvidersMock({ useOrganization: () => ({ organization: undefined }) })

    const { result } = renderHook(() => useOrganizationMeta(), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.meta).toEqual({ isSidebarTutorialClosed: true }))
    expect(bearedFetch).toHaveBeenCalledWith(expect.stringContaining('0xorg'))
  })

  it('does not read the meta without a session address', () => {
    setAuthMock({ currentAddress: undefined, bearedFetch })

    renderHook(() => useOrganizationMeta(), { wrapper: AllProviders })

    expect(bearedFetch).not.toHaveBeenCalled()
  })
})

describe('usePrefetchOrganization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    bearedFetch.mockResolvedValue({ meta: {} })
    getOrganization.mockResolvedValue({ address: '0xstored' })
    setAuthMock({ bearedFetch })
  })

  it('starts the organization and meta reads into the shared cache entries', async () => {
    const queryClient = createTestQueryClient()

    renderHook(() => usePrefetchOrganization('0xstored'), {
      wrapper: ({ children }) => <AllProviders queryClient={queryClient}>{children}</AllProviders>,
    })

    await waitFor(() => expect(queryClient.getQueryData(['organization', '0xstored'])).toEqual({ address: '0xstored' }))
    expect(getOrganization).toHaveBeenCalledWith('0xstored')
    await waitFor(() => expect(queryClient.getQueryData(['organizations', 'meta', '0xstored'])).toEqual({}))
  })

  it('fetches nothing without an address', () => {
    renderHook(() => usePrefetchOrganization(undefined), { wrapper: AllProviders })

    expect(getOrganization).not.toHaveBeenCalled()
    expect(bearedFetch).not.toHaveBeenCalled()
  })
})
