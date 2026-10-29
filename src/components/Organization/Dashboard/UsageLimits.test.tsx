import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { quantity } from '~utils/numbers'
import { UsageLimits } from './UsageLimits'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    loading: false,
    subscription: {
      plan: {
        organization: { maxProcesses: 1, maxCensus: 100 },
        features: { '2FAemail': 0, '2FAsms': 0 },
      },
      usage: { processes: 3, sentEmails: 0, sentSMS: 0, users: 0, subOrgs: 0 },
      subscriptionDetails: { maxCensusSize: 100 },
    },
  }),
}))

const members = vi.hoisted(() => ({ total: 50 }))

vi.mock('~queries/members', () => ({
  usePaginatedMembers: () => ({ data: { pagination: { totalItems: members.total } } }),
}))

describe('UsageLimits', () => {
  beforeEach(() => {
    members.total = 50
  })

  it('renders plan usage section', () => {
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )
    expect(screen.getByText('Plan usage')).toBeInTheDocument()
  })

  it('caps the memberbase at the fixed organization limit, whatever the plan says', () => {
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    expect(screen.getByText(`/ ${(50_000).toLocaleString()}`)).toBeInTheDocument()
  })

  it('shows the voting process count without a cap, so it has no progress bar', () => {
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    // Three processes against a plan maximum of one would have shown as exceeded
    expect(screen.getByText('Voting processes')).toBeInTheDocument()
    expect(screen.queryByText(/\/ 1$/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(1)
    expect(screen.queryByText(/Upgrade plan/)).not.toBeInTheDocument()
  })

  it('explains that the memberbase is full, without an upgrade link, once it reaches the fixed limit', () => {
    members.total = 50_000
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    expect(
      screen.getByText(`Your memberbase has reached the limit of ${quantity(50_000)} members.`)
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /upgrade/i })).not.toBeInTheDocument()
  })

  it('shows no limit message below the fixed limit', () => {
    members.total = 49_999
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    expect(screen.queryByText(/has reached the limit/)).not.toBeInTheDocument()
  })
})
