import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '~src/test-utils'
import OrganizationDashboard from './index'

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => ({ data: null, isLoading: false, isError: false, error: null }),
  }
})

vi.mock('@vocdoni/react-providers', () => ({
  ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useClient: () => ({ client: {}, account: {} }),
  useOrganization: () => ({ organization: null }),
}))

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: { firstName: 'Jane' }, isLoading: false }),
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({ subscription: null, loading: false }),
}))

vi.mock('~src/queries/organization', () => ({
  CheckboxTypes: { route: 'route', modal: 'modal' },
  useOrganizationSetup: () => ({ checklist: [], progress: 0, isStepsAccordionOpen: false }),
  paginatedElectionsQuery: () => ({ queryKey: ['elections'], queryFn: vi.fn() }),
}))

vi.mock('react-player', () => ({
  default: () => <div>Player</div>,
}))

vi.mock('~components/shared/Layout/WhatsappButton', () => ({
  WhatsAppButton: () => <div>WhatsApp</div>,
}))

vi.mock('~shared/Dashboard/Booker', () => ({
  DashboardBookerModalButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('~shared/Layout/InvertedAccordionIcon', () => ({
  default: () => <div>Icon</div>,
}))

vi.mock('~components/vocdoni-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/vocdoni-ui')>()
  return {
    ...actual,
    ElectionStatusBadge: () => <div>Status</div>,
    ElectionTitle: () => <div>Title</div>,
  }
})

vi.mock('./UsageLimits', () => ({
  UsageLimits: () => <div>UsageLimits</div>,
}))

describe('OrganizationDashboard', () => {
  it('renders dashboard header', () => {
    const env = (import.meta as any).env || {}
    Object.defineProperty(import.meta, 'env', {
      value: { ...env, VIDEO_TUTORIAL: { en: 'https://example.com' } },
      configurable: true,
    })

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <OrganizationDashboard />
      </MemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
