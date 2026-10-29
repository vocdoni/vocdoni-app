import { currency } from '~utils/numbers'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { IntegratorOverview } from './Overview'

vi.mock('~src/queries/integrators', () => ({
  useIntegratorInfo: vi.fn(),
}))

vi.mock('~src/queries/wallet', () => ({
  useWallet: vi.fn(),
  useWalletAccess: vi.fn(),
}))

// Avoid loading the Cal.com embed (@calcom/embed-react) in jsdom.
vi.mock('~components/Dashboard/Booker', () => ({
  BookerModalButton: ({ children }: { children?: React.ReactNode }) => <button>{children}</button>,
}))

import { useIntegratorInfo } from '~src/queries/integrators'
import { useWallet, useWalletAccess } from '~src/queries/wallet'

const mockInfo = (overrides: Partial<ReturnType<typeof useIntegratorInfo>> = {}) =>
  ({ data: undefined, isLoading: false, error: null, ...overrides }) as any

const mockWallet = (overrides: Partial<ReturnType<typeof useWallet>> = {}) =>
  ({ data: undefined, isLoading: false, error: null, ...overrides }) as any

const walletData = {
  balanceCents: 12345,
  currency: 'eur',
  history: [],
  pagination: { currentPage: 1, lastPage: 1, nextPage: null, previousPage: null, totalItems: 0 },
}

// Pay-per-process: no limits and no managedProcesses.
const payPerProcessData = {
  enabled: true,
  usage: { managedOrgs: 2, sentVotes: 5, sentSMS: 1, sentEmails: 0 },
}

const enabledData = {
  enabled: true,
  limits: { maxManagedOrgs: 10, maxManagedProcesses: 50, maxVotes: 0, maxSMS: 100, maxEmails: 200 },
  usage: { managedOrgs: 3, managedProcesses: 12, sentVotes: 999, sentSMS: 100, sentEmails: 40 },
}

describe('IntegratorOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useWallet).mockReturnValue(mockWallet())
    vi.mocked(useWalletAccess).mockReturnValue({ canView: true, canTopUp: true })
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

  it('renders without limits and managedProcesses, counting the metrics it gets as used', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ data: payPerProcessData }))

    render(<IntegratorOverview />, { wrapper: TestMemoryRouter })

    expect(screen.queryByText('Unable to load integrator quota')).not.toBeInTheDocument()
    expect(screen.queryByText('Voting processes created')).not.toBeInTheDocument()
    expect(screen.getByText('Organizations created')).toBeInTheDocument()
    expect(screen.getAllByText('used')).toHaveLength(4)
  })

  it('shows the wallet balance and a link to manage it', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ data: enabledData }))
    vi.mocked(useWallet).mockReturnValue(mockWallet({ data: walletData }))

    render(<IntegratorOverview />, { wrapper: TestMemoryRouter })

    expect(screen.getByText('Wallet balance')).toBeInTheDocument()
    expect(screen.getByText(currency(12345, 'EUR'))).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Manage wallet' })).toHaveAttribute(
      'href',
      '/integrators/configuration/wallet'
    )
  })

  it('hides the wallet card from roles that cannot read the wallet', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ data: enabledData }))
    vi.mocked(useWallet).mockReturnValue(mockWallet({ data: walletData }))
    vi.mocked(useWalletAccess).mockReturnValue({ canView: false, canTopUp: false })

    render(<IntegratorOverview />, { wrapper: TestMemoryRouter })

    expect(screen.queryByText('Wallet balance')).not.toBeInTheDocument()
    expect(screen.getByText('Organizations created')).toBeInTheDocument()
  })

  it('hides the wallet card when the wallet cannot be loaded', () => {
    vi.mocked(useIntegratorInfo).mockReturnValue(mockInfo({ data: enabledData }))
    vi.mocked(useWallet).mockReturnValue(mockWallet({ error: new Error('no wallet') }))

    render(<IntegratorOverview />, { wrapper: TestMemoryRouter })

    expect(screen.queryByText('Wallet balance')).not.toBeInTheDocument()
    expect(screen.getByText('Organizations created')).toBeInTheDocument()
  })
})
