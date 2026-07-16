import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { Route, Routes as RouterRoutes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TestMemoryRouter } from '~src/test-utils'
import { system } from '~theme/system'

vi.mock('~src/queries/account', () => ({
  useProfile: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('~src/queries/integrators', () => ({
  useProvisionIntegratorOrganization: vi.fn(),
}))

vi.mock('~components/Auth/useAuthProvider', () => ({
  LocalStorageKeys: { SignerAddress: 'signerAddress' },
}))

// The notice has its own test; here we only assert the guard renders it (instead of redirecting).
vi.mock('~components/Integrator/NotIntegratorNotice', () => ({
  default: () => <div>Not an integrator notice</div>,
}))

vi.mock('./routes', () => ({
  Routes: {
    dashboard: { base: '/admin' },
    integrators: { base: '/integrators', signIn: '/integrators/signin' },
  },
}))

import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from '~src/queries/account'
import { useProvisionIntegratorOrganization } from '~src/queries/integrators'
import IntegratorOrgGuard from './IntegratorOrgGuard'

const renderGuard = () =>
  render(
    <ChakraProvider value={system}>
      <TestMemoryRouter initialEntries={['/integrators']}>
        <RouterRoutes>
          <Route path='/admin' element={<div>Admin</div>} />
          <Route path='/integrators' element={<IntegratorOrgGuard />}>
            <Route index element={<div>Integrator Dashboard</div>} />
          </Route>
        </RouterRoutes>
      </TestMemoryRouter>
    </ChakraProvider>
  )

const mockAuth = (overrides = {}) =>
  ({ isAuthenticated: true, isAuthLoading: false, signerRefresh: vi.fn(), ...overrides }) as any

const mockProfile = (orgs: Array<{ isIntegrator?: boolean; address?: string }>) =>
  ({
    data: {
      organizations: orgs.map((o, i) => ({
        role: 'admin',
        isIntegrator: o.isIntegrator,
        organization: { address: o.address ?? `0x${i + 1}` },
      })),
    },
    isLoading: false,
  }) as any

const mockProvision = (overrides = {}) =>
  ({
    mutate: vi.fn(),
    isIdle: true,
    isSuccess: false,
    isError: false,
    data: undefined,
    reset: vi.fn(),
    ...overrides,
  }) as any

describe('IntegratorOrgGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    vi.mocked(useProvisionIntegratorOrganization).mockReturnValue(mockProvision())
  })

  it('renders the integrator app when the user has an integrator org', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(mockProfile([{ isIntegrator: true }]))

    renderGuard()

    expect(screen.getByText('Integrator Dashboard')).toBeInTheDocument()
  })

  it('shows the not-integrator notice when the selected org is not an integrator', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(mockProfile([{ isIntegrator: false }]))

    renderGuard()

    expect(screen.getByText('Not an integrator notice')).toBeInTheDocument()
    expect(screen.queryByText('Integrator Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })

  it('shows the notice when a non-integrator org is selected, even if the user also owns an integrator one', () => {
    // The selected org (signerAddress) is the non-integrator one; the user also owns an integrator
    // org. Routing must follow the selection, not "owns any integrator org".
    localStorage.setItem('signerAddress', '0xregular')
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(
      mockProfile([
        { isIntegrator: false, address: '0xregular' },
        { isIntegrator: true, address: '0xintegrator' },
      ])
    )

    renderGuard()

    expect(screen.getByText('Not an integrator notice')).toBeInTheDocument()
    expect(screen.queryByText('Integrator Dashboard')).not.toBeInTheDocument()
  })

  it('renders the integrator app when the selected org is the integrator one', () => {
    localStorage.setItem('signerAddress', '0xintegrator')
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(
      mockProfile([
        { isIntegrator: false, address: '0xregular' },
        { isIntegrator: true, address: '0xintegrator' },
      ])
    )

    renderGuard()

    expect(screen.getByText('Integrator Dashboard')).toBeInTheDocument()
  })

  it('provisions an organization in the background when the user has none', () => {
    const mutate = vi.fn()
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(mockProfile([]))
    vi.mocked(useProvisionIntegratorOrganization).mockReturnValue(mockProvision({ mutate }))

    renderGuard()

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Setting up your integrator account…')).toBeInTheDocument()
  })
})
