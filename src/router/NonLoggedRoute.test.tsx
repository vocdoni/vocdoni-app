import { VocdoniApiError } from '@vocdoni/api-client'
import { screen } from '@testing-library/react'
import { Route, Routes as RouterRoutes } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { renderWithProviders, TestMemoryRouter } from '~src/test-utils'
import NonLoggedRoute from './NonLoggedRoute'
import { Routes } from './routes'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockAuth = (overrides = {}) =>
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    isAuthLoading: false,
    currentAddress: undefined,
    addressesError: null,
    ...overrides,
  } as never)

// The SaaS answers /auth/addresses with 404 "user has no organizations" (code 40012)
// for an account that has just verified its email.
const noOrganizationsError = () => new VocdoniApiError(404, { code: 40012 }, 'user has no organizations', 40012)

const renderAt = (initialEntry: string, element = <NonLoggedRoute />) =>
  renderWithProviders(
    <TestMemoryRouter initialEntries={[initialEntry]}>
      <RouterRoutes>
        <Route element={element}>
          <Route path={Routes.auth.verify} element={<div>Verify</div>} />
          <Route path={Routes.auth.signIn} element={<div>Sign in</div>} />
        </Route>
        <Route path={Routes.auth.organizationCreate} element={<div>Create organization</div>} />
        <Route path={Routes.dashboard.base} element={<div>Dashboard</div>} />
        <Route path={Routes.integrators.base} element={<div>Integrators</div>} />
      </RouterRoutes>
    </TestMemoryRouter>
  )

describe('NonLoggedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends a just-verified account with no organization to the organization creation step', () => {
    // Verifying the email logs the account in while it is still on /account/verify, so this
    // guard runs before Verify's own navigation settles. Sending it to the dashboard here
    // replaces the org creation step the account was on its way to.
    mockAuth({ addressesError: noOrganizationsError() })

    renderAt(Routes.auth.verify)

    expect(screen.getByText('Create organization')).toBeInTheDocument()
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('sends an account that owns an organization to the dashboard', () => {
    mockAuth({ currentAddress: '0x123' })

    renderAt(Routes.auth.signIn)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('sends an account to the dashboard when the address lookup failed, rather than to onboarding', () => {
    // A 502 leaves the address unset just like "no organizations" does; an owner must not be
    // pushed into creating a second organization because a request failed.
    mockAuth({ addressesError: new VocdoniApiError(502, undefined, 'Bad Gateway') })

    renderAt(Routes.auth.signIn)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('keeps the integrators group on its own root when it has no organization yet', () => {
    // Integrator organizations are provisioned inside the integrators app, not through
    // the /account organization creation step.
    mockAuth({ addressesError: noOrganizationsError() })

    renderAt(Routes.auth.signIn, <NonLoggedRoute redirectTo={Routes.integrators.base} />)

    expect(screen.getByText('Integrators')).toBeInTheDocument()
  })

  it('renders the auth screen for an account that is not logged in', () => {
    mockAuth({ isAuthenticated: false })

    renderAt(Routes.auth.signIn)

    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })
})
