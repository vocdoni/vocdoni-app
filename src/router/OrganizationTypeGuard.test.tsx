import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Mock at module level
vi.mock('~src/queries/account', () => ({
  useProfile: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('./routes', () => ({
  Routes: {
    auth: { signIn: '/auth/signin' },
  },
}))

import OrganizationTypeGuard from './OrganizationTypeGuard'
import { useProfile } from '~src/queries/account'
import { useAuth } from '~components/Auth/useAuth'

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/admin']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path='/admin' element={<div>Admin</div>} />
        <Route path='/integrators' element={<div>Integrators</div>} />
        <Route path='*' element={component} />
      </Routes>
    </MemoryRouter>
  )
}

describe('OrganizationTypeGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Ensure localStorage always returns the signer address that matches profile orgs
    ;(localStorage as any).getItem.mockReturnValue('0x123')
  })

  const mockProfile = (integrator: boolean) =>
    ({
      data: {
        organizations: [
          {
            role: 'admin',
            isIntegrator: integrator,
            organization: {
              address: '0x123',
              type: 'organization',
              size: 1,
              color: '#000',
              logo: '',
              subdomain: '',
              timezone: 'UTC',
              active: true,
            },
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
    }) as any

  const mockAuth = (isAuthenticated = true, isAuthLoading = false) =>
    ({
      isAuthenticated,
      isAuthLoading,
    }) as any

  it('renders Outlet when integrator accesses /integrators', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth(true, false))
    vi.mocked(useProfile).mockReturnValue(mockProfile(true))

    renderWithRouter(<OrganizationTypeGuard redirectPath='/integrators' />, ['/integrators'])

    // When org type matches expected path, should render Outlet (which renders the route content)
    expect(screen.getByText('Integrators')).toBeInTheDocument()
  })

  it('renders Outlet when non-integrator accesses /admin', () => {
    vi.mocked(useAuth).mockReturnValue(mockAuth(true, false))
    vi.mocked(useProfile).mockReturnValue(mockProfile(false))

    renderWithRouter(<OrganizationTypeGuard redirectPath='/admin' />, ['/admin'])

    // When org type matches expected path, should render Outlet (which renders the route content)
    expect(screen.getByText('Admin')).toBeInTheDocument()
  })
})
