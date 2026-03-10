import { LuCalendar } from 'react-icons/lu'
import { mockUseClient, mockUseOrganization, render, screen, TestMemoryRouter, within } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import OrganizationDashboard from './index'

const useOrganizationSetupMock = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-query')
  return {
    ...actual,
    useQuery: () => ({ data: null, isLoading: false, isError: false, error: null }),
  }
})

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: { firstName: 'Jane' }, isLoading: false }),
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({ subscription: null, loading: false }),
}))

vi.mock('~src/queries/organization', () => ({
  CheckboxTypes: { route: 'route', modal: 'modal' },
  useOrganizationSetup: () => useOrganizationSetupMock(),
  paginatedElectionsQuery: () => ({ queryKey: ['elections'], queryFn: vi.fn() }),
}))

vi.mock('react-player', () => ({
  default: () => <div>Player</div>,
}))

vi.mock('~components/Layout/WhatsappButton', () => ({
  WhatsAppButton: () => <div>WhatsApp</div>,
}))

vi.mock('@calcom/embed-react', () => ({
  default: () => <div>CalEmbed</div>,
  getCalApi: vi.fn(async () => vi.fn()),
}))

vi.mock('~components/Layout/InvertedAccordionIcon', () => ({
  default: () => <div>Icon</div>,
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
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      useClient: () => mockUseClient({ client: {}, account: {} }),
      useOrganization: () => mockUseOrganization({ organization: null }),
    })
  })

  it('renders dashboard header', () => {
    useOrganizationSetupMock.mockReturnValue({ checklist: [], progress: 0, isStepsAccordionOpen: false })
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

  it('renders modal checklist item as a checkbox trigger without a button', () => {
    useOrganizationSetupMock.mockReturnValue({
      checklist: [
        {
          id: 'expertCallBooking',
          label: 'Book a free call with our experts',
          type: 'modal',
          icon: LuCalendar,
          completed: false,
        },
      ],
      progress: 0,
      isStepsAccordionOpen: true,
    })

    render(
      <TestMemoryRouter>
        <OrganizationDashboard />
      </TestMemoryRouter>
    )

    const checkbox = screen.getByRole('checkbox', { name: /book a free call with our experts/i })
    const trigger = document.querySelector('[data-part=\"trigger\"]') as HTMLElement | null

    expect(checkbox).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /book a free call with our experts/i })).not.toBeInTheDocument()
    expect(checkbox).not.toHaveAttribute('data-part', 'trigger')
    expect(checkbox).not.toHaveAttribute('data-scope', 'dialog')
    expect(trigger).toBeInTheDocument()
    expect(trigger?.getAttribute('role')).not.toBe('checkbox')
    expect(
      within(trigger as HTMLElement).getByRole('checkbox', { name: /book a free call with our experts/i })
    ).toBeInTheDocument()
  })
})
