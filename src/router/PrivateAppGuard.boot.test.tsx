import { screen, waitFor } from '@testing-library/react'
import { useQueryClient } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { Outlet, Route, Routes as RouterRoutes } from 'react-router'
import { AuthProvider } from '~components/Auth/AuthContext'
import { useAuth } from '~components/Auth/useAuth'
import { createTestQueryClient, renderWithProviders, TestMemoryRouter } from '~src/test-utils'
import AccountProtectedRoute from './AccountProtectedRoute'
import PrivateAppGuard from './PrivateAppGuard'
import { Routes } from './routes'

// A cold load of /admin with the real session state (useAuthProvider), only the network faked.

vi.mock('wagmi', () => ({
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

vi.mock('~components/Auth/authQueries', () => ({
  useLogin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRegister: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVerifyMail: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

const addresses = vi.fn()
const getOrganization = vi.fn()
vi.mock('~src/providers/ApiClientProvider', async () => {
  const { ClientProvider } =
    await vi.importActual<typeof import('@vocdoni/react-providers')>('@vocdoni/react-providers')
  return {
    ApiClientProvider: ({ children }: { children: ReactNode }) => (
      <ClientProvider apiUrl='http://test.local'>{children}</ClientProvider>
    ),
    AUTH_STORAGE_KEY: 'auth',
    useApiClient: () => ({ client: { auth: { addresses }, organizations: { get: getOrganization } } }),
  }
})

// The REST calls bearedFetch makes (profile, organization meta).
const restCall = vi.fn()
vi.mock('~components/Auth/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Auth/api')>()
  return { ...actual, api: (path: string) => restCall(path) }
})

const deferred = <T,>() => {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((r) => (resolve = r))
  return { promise, resolve }
}

const seenAddresses: Array<string | undefined> = []
const AdminPage = () => {
  const { currentAddress } = useAuth()
  seenAddresses.push(currentAddress)
  return <div>Acting as {currentAddress}</div>
}

const Frame = () => (
  <div>
    <nav>Sidebar</nav>
    <Outlet />
  </div>
)

let cacheKeys: () => unknown[][] = () => []
const CacheProbe = () => {
  const queryClient = useQueryClient()
  cacheKeys = () =>
    queryClient
      .getQueryCache()
      .getAll()
      .map((query) => [...query.queryKey])
  return null
}

const renderColdAdmin = () =>
  renderWithProviders(
    <TestMemoryRouter initialEntries={[Routes.dashboard.base]}>
      <CacheProbe />
      <RouterRoutes>
        <Route element={<AccountProtectedRoute waitForSession={false} />}>
          <Route element={<Frame />}>
            <Route element={<PrivateAppGuard redirectPath={Routes.dashboard.base} />}>
              <Route path={Routes.dashboard.base} element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route path={Routes.auth.signIn} element={<div>Sign in</div>} />
      </RouterRoutes>
    </TestMemoryRouter>,
    { wrapper: AuthProvider, queryClient: createTestQueryClient() }
  )

describe('cold load of the admin app', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    seenAddresses.length = 0
    localStorage.setItem('auth.token', 'token')
    localStorage.setItem('auth.expiry', '2099-01-01T00:00:00Z')
  })

  it('fetches the session, the profile and the stored organization in parallel, and renders only the confirmed one', async () => {
    // The stored address belongs to a previous user of this browser; this account owns 0xreal.
    localStorage.setItem('signerAddress', '0xstale')
    const addressList = deferred<{ addresses: string[] }>()
    const profile = deferred<unknown>()
    addresses.mockReturnValue(addressList.promise)
    getOrganization.mockResolvedValue({ address: '0xstale', name: { default: 'Not yours' } })
    restCall.mockImplementation((path: string) =>
      path.startsWith('users/me') ? profile.promise : Promise.resolve({ meta: {} })
    )

    renderColdAdmin()

    // First round: frame on screen, three requests in flight together, no page yet.
    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    await waitFor(() => expect(getOrganization).toHaveBeenCalledWith('0xstale'))
    expect(addresses).toHaveBeenCalledTimes(1)
    expect(restCall).toHaveBeenCalledWith(expect.stringMatching(/^users\/me/))
    expect(screen.queryByText(/Acting as/)).not.toBeInTheDocument()

    addressList.resolve({ addresses: ['0xreal'] })
    profile.resolve({ organizations: [{ role: 'admin', organization: { address: '0xreal' } }] })

    expect(await screen.findByText('Acting as 0xreal')).toBeInTheDocument()
    expect(seenAddresses).not.toContain('0xstale')
    expect(seenAddresses).not.toContain(undefined)
    await waitFor(() => expect(cacheKeys().filter((key) => key.includes('0xstale'))).toEqual([]))
    expect(localStorage.getItem('signerAddress')).toBe('0xreal')
  })

  it('sends a session the backend rejects to sign in', async () => {
    const { VocdoniApiError } = await import('@vocdoni/api-client')
    addresses.mockRejectedValue(new VocdoniApiError(401, {}, 'authentication required', 40001))
    restCall.mockRejectedValue(new Error('unauthorized'))

    renderColdAdmin()

    expect(await screen.findByText('Sign in')).toBeInTheDocument()
    expect(screen.queryByText(/Acting as/)).not.toBeInTheDocument()
  })
})
