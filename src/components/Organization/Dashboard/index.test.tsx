import { mockUseOrganization, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock, setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import OrganizationDashboard from './index'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

let electionsQueryState: any = { data: null, isLoading: false, isError: false, error: null }

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => electionsQueryState,
  }
})

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: { firstName: 'Jane' }, isLoading: false }),
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({ subscription: null, loading: false }),
}))

vi.mock('~src/queries/organization', () => ({
  paginatedElectionsQuery: () => ({ queryKey: ['elections'], queryFn: vi.fn() }),
}))

vi.mock('react-player', () => ({
  default: () => <div>Player</div>,
}))

vi.mock('~components/Layout/WhatsappButton', () => ({
  WhatsAppButton: () => <div>WhatsApp</div>,
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionStatusBadge: () => <div>Status</div>,
    ElectionTitle: () => <div>Title</div>,
  }
})

vi.mock('./UsageLimits', () => ({
  UsageLimits: () => <div>UsageLimits</div>,
}))

describe('OrganizationDashboard', () => {
  beforeEach(() => {
    electionsQueryState = { data: null, isLoading: false, isError: false, error: null }
    setAuthMock({ currentAddress: '0xabc' })
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      useOrganization: () => mockUseOrganization({ organization: null }),
    })
  })

  it('offers to create an organization even when the shared elections cache holds an error', () => {
    // The elections cache entry is keyed per organization, but the /admin/processes loaders can
    // leave it in an error state for an account that has no organization at all. A disabled
    // useQuery still reports that cached error, and showing it here hides the only way forward.
    setAuthMock({ currentAddress: undefined })
    electionsQueryState = {
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('invalid URL parameter: missing orgAddress'),
    }

    render(
      <TestMemoryRouter>
        <OrganizationDashboard />
      </TestMemoryRouter>
    )

    expect(screen.getByText('Create your first organization')).toBeInTheDocument()
    expect(screen.queryByText('Error loading voting processes')).not.toBeInTheDocument()
  })

  it('renders dashboard header', () => {
    const env = (import.meta as any).env || {}
    Object.defineProperty(import.meta, 'env', {
      value: { ...env, VIDEO_TUTORIAL: { en: 'https://example.com' } },
      configurable: true,
    })

    render(
      <TestMemoryRouter>
        <OrganizationDashboard />
      </TestMemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
