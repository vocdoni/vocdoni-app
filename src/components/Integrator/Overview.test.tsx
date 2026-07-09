import { render, screen } from '~src/test-utils'
import { IntegratorOverview } from './Overview'

vi.mock('~src/queries/integrators', () => ({
  useIntegratorInfo: vi.fn(),
}))

// Avoid loading the Cal.com embed (@calcom/embed-react) in jsdom.
vi.mock('~components/Dashboard/Booker', () => ({
  BookerModalButton: ({ children }: { children?: React.ReactNode }) => <button>{children}</button>,
}))

import { useIntegratorInfo } from '~src/queries/integrators'

const mockInfo = (overrides: Partial<ReturnType<typeof useIntegratorInfo>> = {}) =>
  ({ data: undefined, isLoading: false, error: null, ...overrides }) as any

const enabledData = {
  enabled: true,
  limits: { maxManagedOrgs: 10, maxManagedProcesses: 50, maxVotes: 0, maxSMS: 100, maxEmails: 200 },
  usage: { managedOrgs: 3, managedProcesses: 12, sentVotes: 999, sentSMS: 100, sentEmails: 40 },
}

describe('IntegratorOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders quota cards with usage and limits', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ data: enabledData }))

    render(<IntegratorOverview />)

    expect(screen.getByText('Organizations created')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('/ 10')).toBeInTheDocument()
  })

  it('shows "Unlimited" when a limit is 0 (maxVotes)', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ data: enabledData }))

    render(<IntegratorOverview />)

    // Votes cast has maxVotes: 0 -> unlimited
    expect(screen.getByText('Unlimited')).toBeInTheDocument()
  })

  it('flags a metric that has reached its limit', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ data: enabledData }))

    render(<IntegratorOverview />)

    // SMS verifications: usage 100 >= limit 100 -> "Limit reached"
    expect(screen.getByText('Limit reached')).toBeInTheDocument()
  })

  it('renders an error when the quota cannot be loaded', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ error: new Error('boom') }))

    render(<IntegratorOverview />)

    expect(screen.getByText('Unable to load integrator quota')).toBeInTheDocument()
    expect(screen.queryByText('Organizations created')).not.toBeInTheDocument()
  })
})
