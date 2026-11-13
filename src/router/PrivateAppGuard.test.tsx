import { screen } from '@testing-library/react'
import { Outlet, Route, Routes as RouterRoutes, useOutletContext } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from '~src/queries/account'
import { renderWithProviders, TestMemoryRouter } from '~src/test-utils'
import AccountProtectedRoute from './AccountProtectedRoute'
import PrivateAppGuard from './PrivateAppGuard'
import { Routes } from './routes'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('~src/queries/account', () => ({
  useProfile: vi.fn(),
}))

const prefetchMock = vi.fn()
vi.mock('~src/queries/organization', () => ({
  usePrefetchOrganization: (address?: string) => prefetchMock(address),
}))

const mockAuth = (overrides = {}) =>
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    isAuthLoading: false,
    currentAddress: '0xorg',
    unconfirmedAddress: undefined,
    ...overrides,
  } as never)

const membership = (isIntegrator: boolean) => ({
  role: 'admin',
  isIntegrator,
  organization: { address: '0xorg' },
})

const mockProfile = ({ isLoading = false, isIntegrator = false } = {}) =>
  vi.mocked(useProfile).mockReturnValue({
    data: isLoading ? undefined : { organizations: [membership(isIntegrator)] },
    isLoading,
  } as never)

// Stands in for LayoutDashboard: the frame passes the outlet context the pages read.
const Frame = () => (
  <div>
    <nav>Sidebar</nav>
    <Outlet context={{ reduced: true }} />
  </div>
)

const AdminPage = () => {
  const context = useOutletContext<{ reduced: boolean }>()
  return <div>Admin page {context?.reduced ? 'reduced' : 'expanded'}</div>
}

// Same nesting as the /admin routes: session check, then the frame, then the waiting guard.
const renderAdmin = () =>
  renderWithProviders(
    <TestMemoryRouter initialEntries={[Routes.dashboard.base]}>
      <RouterRoutes>
        <Route element={<AccountProtectedRoute waitForSession={false} />}>
          <Route element={<Frame />}>
            <Route element={<PrivateAppGuard redirectPath={Routes.dashboard.base} />}>
              <Route path={Routes.dashboard.base} element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
        <Route path={Routes.auth.signIn} element={<div>Sign in</div>} />
        <Route path={Routes.integrators.base} element={<div>Integrators</div>} />
      </RouterRoutes>
    </TestMemoryRouter>
  )

describe('admin app guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockProfile()
  })

  it('sends a visitor with no session to sign in, remembering where they were going', () => {
    mockAuth({ isAuthenticated: false, currentAddress: undefined })

    renderAdmin()

    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.queryByText('Sidebar')).not.toBeInTheDocument()
    expect(localStorage.getItem('redirectTo')).toBe(Routes.dashboard.base)
  })

  it('shows the frame and a single waiting state while the session is being confirmed', () => {
    mockAuth({ isAuthLoading: true, currentAddress: undefined, unconfirmedAddress: '0xstored' })
    mockProfile({ isLoading: true })

    renderAdmin()

    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getAllByText('loading')).toHaveLength(1)
    expect(screen.queryByText(/Admin page/)).not.toBeInTheDocument()
  })

  it('starts fetching the stored organization while the session is being confirmed', () => {
    mockAuth({ isAuthLoading: true, currentAddress: undefined, unconfirmedAddress: '0xstored' })

    renderAdmin()

    expect(prefetchMock).toHaveBeenCalledWith('0xstored')
    expect(screen.queryByText(/Admin page/)).not.toBeInTheDocument()
  })

  it('keeps waiting for the profile once the address list is known', () => {
    mockAuth()
    mockProfile({ isLoading: true })

    renderAdmin()

    expect(screen.getAllByText('loading')).toHaveLength(1)
    expect(screen.queryByText(/Admin page/)).not.toBeInTheDocument()
  })

  it('sends an integrator organization to the integrators app', () => {
    mockAuth()
    mockProfile({ isIntegrator: true })

    renderAdmin()

    expect(screen.getByText('Integrators')).toBeInTheDocument()
    expect(screen.queryByText(/Admin page/)).not.toBeInTheDocument()
  })

  it('renders the page with the frame outlet context once the session is confirmed', () => {
    mockAuth()

    renderAdmin()

    expect(screen.getByText('Sidebar')).toBeInTheDocument()
    expect(screen.getByText('Admin page reduced')).toBeInTheDocument()
  })

  it('lets an integrator organization into the integrators app', () => {
    mockAuth()
    mockProfile({ isIntegrator: true })

    renderWithProviders(
      <TestMemoryRouter initialEntries={[Routes.integrators.base]}>
        <RouterRoutes>
          <Route element={<PrivateAppGuard redirectPath={Routes.integrators.base} />}>
            <Route path={Routes.integrators.base} element={<div>Integrators page</div>} />
          </Route>
          <Route path={Routes.dashboard.base} element={<div>Admin</div>} />
        </RouterRoutes>
      </TestMemoryRouter>
    )

    expect(screen.getByText('Integrators page')).toBeInTheDocument()
  })
})
