import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '~src/test-utils'
import { UsageLimits } from './UsageLimits'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    loading: false,
    subscription: {
      plan: {
        organization: { maxProcesses: 1, maxCensus: 100 },
        features: { '2FAemail': 0, '2FAsms': 0 },
      },
      usage: { processes: 1, sentEmails: 0, sentSMS: 0, users: 0, subOrgs: 0 },
      subscriptionDetails: { maxCensusSize: 100 },
    },
  }),
}))

vi.mock('~queries/members', () => ({
  usePaginatedMembers: () => ({ data: { pagination: { totalItems: 50 } } }),
}))

describe('UsageLimits', () => {
  it('renders plan usage section', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <UsageLimits />
      </MemoryRouter>
    )
    expect(screen.getByText('Plan Usage')).toBeInTheDocument()
  })
})
