import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes as RouterRoutes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
      <MemoryRouter initialEntries={['/integrators']}>
        <RouterRoutes>
          <Route path='/admin' element={<div>Admin</div>} />
          <Route path='/integrators' element={<IntegratorOrgGuard />}>
            <Route index element={<div>Integrator Dashboard</div>} />
          </Route>
        </RouterRoutes>
      </MemoryRouter>
    </ChakraProvider>
  )

const mockAuth = (overrides = {}) =>
  ({ isAuthenticated: true, isAuthLoading: false, signerRefresh: vi.fn(), ...overrides }) as any

const mockProfile = (orgs: Array<{ isIntegrator?: boolean }>) =>
  ({
    data: { organizations: orgs.map((o) => ({ role: 'admin', organization: { address: '0x1', isIntegrator: o.isIntegrator } })) },
    isLoading: false,
  }) as any

const mockProvision = (overrides = {}) =>
  ({ mutate: vi.fn(), isIdle: true, isSuccess: false, isError: false, data: undefined, reset: vi.fn(), ...overrides }) as any

describe('IntegratorOrgGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useProvisionIntegratorOrganization).mockReturnValue(mockProvision())
  })

  it('renders the integrator app when the user has an integrator org', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(mockProfile([{ isIntegrator: true }]))

    renderGuard()

    expect(screen.getByText('Integrator Dashboard')).toBeInTheDocument()
  })

  it('redirects a user whose org is not an integrator to /admin', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(mockProfile([{ isIntegrator: false }]))

    renderGuard()

    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.queryByText('Integrator Dashboard')).not.toBeInTheDocument()
  })

  it('provisions an organization in the background when the user has none', () => {
    const mutate = vi.fn()
    vi.mocked(useAuth).mockReturnValue(mockAuth())
    vi.mocked(useProfile).mockReturnValue(mockProfile([]))
    vi.mocked(useProvisionIntegratorOrganization).mockReturnValue(mockProvision({ mutate }))

    renderGuard()

    expect(mutate).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Setting up your organization…')).toBeInTheDocument()
  })
})
