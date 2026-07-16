import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: true })),
}))

// Mock the same specifier the component imports (see ManageProcessLink.tsx), so the mock
// doesn't silently rely on `~src`/`~` alias resolution matching.
vi.mock('~queries/account', () => ({
  useProfile: vi.fn(() => ({ data: undefined })),
}))

import { useAuth } from '~components/Auth/useAuth'
import { useProfile } from '~queries/account'
import { ManageProcessLink } from './ManageProcessLink'

const mockProfileOrgs = (addresses: string[]) =>
  vi.mocked(useProfile).mockReturnValue({
    data: { organizations: addresses.map((address) => ({ role: 'admin', organization: { address } })) },
  } as any)

describe('ManageProcessLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any)
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'deadbeef', organizationId: '0xabc', status: 'ONGOING' } }),
    })
  })

  it('links members of the process organization to the dashboard process view', () => {
    mockProfileOrgs(['0xabc'])

    render(<ManageProcessLink />)

    const link = screen.getByRole('link', { name: 'Manage in dashboard' })
    expect(link).toHaveAttribute('href', '/admin/process/0xdeadbeef')
  })

  it('renders nothing when the user is not a member of the process organization', () => {
    mockProfileOrgs(['0xother'])

    render(<ManageProcessLink />)

    expect(screen.queryByRole('link', { name: 'Manage in dashboard' })).not.toBeInTheDocument()
  })

  it('skips the profile query and renders nothing for unauthenticated visitors', () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any)

    render(<ManageProcessLink />)

    expect(useProfile).toHaveBeenCalledWith({ enabled: false })
    expect(screen.queryByRole('link', { name: 'Manage in dashboard' })).not.toBeInTheDocument()
  })
})
