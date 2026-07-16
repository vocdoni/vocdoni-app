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

vi.mock('~src/queries/account', () => ({
  useProfile: vi.fn(),
}))

import { useProfile } from '~src/queries/account'
import { ActionsMenu } from './ActionsMenu'

const mockProfileOrgs = (addresses: string[]) =>
  vi.mocked(useProfile).mockReturnValue({
    data: { organizations: addresses.map((address) => ({ role: 'admin', organization: { address } })) },
  } as any)

describe('ActionsMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'deadbeef', organizationId: '0xabc', status: 'ONGOING' } }),
    })
  })

  it('links members of the process organization to the dashboard process view', () => {
    mockProfileOrgs(['0xabc'])

    render(<ActionsMenu />)

    const link = screen.getByRole('link', { name: 'Manage in dashboard' })
    expect(link).toHaveAttribute('href', '/admin/process/0xdeadbeef')
  })

  it('renders nothing when the user is not a member of the process organization', () => {
    mockProfileOrgs(['0xother'])

    render(<ActionsMenu />)

    expect(screen.queryByRole('link', { name: 'Manage in dashboard' })).not.toBeInTheDocument()
  })

  it('renders nothing for anonymous visitors (no profile)', () => {
    vi.mocked(useProfile).mockReturnValue({ data: undefined } as any)

    render(<ActionsMenu />)

    expect(screen.queryByRole('link', { name: 'Manage in dashboard' })).not.toBeInTheDocument()
  })
})
