import { VocdoniApiError } from '@vocdoni/api-client'
import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { renderWithProviders, TestMemoryRouter } from '~src/test-utils'
import OrganizationProtectedRoute from './OrganizationProtectedRoute'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

const mockAuth = (overrides = {}) =>
  ({ currentAddress: undefined, addressesError: null, refreshAddresses: vi.fn(), ...overrides }) as never

const renderGuard = () =>
  renderWithProviders(
    <TestMemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path='/dashboard' element={<OrganizationProtectedRoute />}>
          <Route index element={<div>Dashboard</div>} />
        </Route>
      </Routes>
    </TestMemoryRouter>
  )

describe('OrganizationProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the dashboard once an organization address is resolved', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth({ currentAddress: '0x123' }))

    renderGuard()

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('sends an account with no organizations to onboarding', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth())

    renderGuard()

    expect(screen.getByText("You don't belong to any organization yet!")).toBeInTheDocument()
  })

  it('onboards a freshly verified account, whose address lookup 404s with "user has no organizations"', () => {
    // /auth/addresses answers 404 {"error":"user has no organizations","code":40012} for a brand
    // new account, so "no organizations" arrives as an error and must not read as a failed lookup.
    vi.mocked(useAuth).mockReturnValue(
      mockAuth({
        addressesError: new VocdoniApiError(404, { code: 40012 }, 'user has no organizations', 40012),
      })
    )

    renderGuard()

    expect(screen.getByText("You don't belong to any organization yet!")).toBeInTheDocument()
    expect(screen.queryByText("We couldn't load your organizations")).not.toBeInTheDocument()
  })

  it('reports a failed address lookup instead of claiming there are no organizations', () => {
    // A 502 leaves currentAddress unset exactly like an empty list does. Showing
    // onboarding here tells an org owner their organizations are gone.
    vi.mocked(useAuth).mockReturnValue(mockAuth({ addressesError: new Error('Bad Gateway') }))

    renderGuard()

    expect(screen.getByText("We couldn't load your organizations")).toBeInTheDocument()
    expect(screen.queryByText("You don't belong to any organization yet!")).not.toBeInTheDocument()
  })
})
