import { render, screen } from '~src/test-utils'
import IntegratorSubscriptionTab from './SubscriptionTab'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: vi.fn(),
}))

vi.mock('~queries/stripe', () => ({
  usePortalSession: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

// Avoid loading the Cal.com embed in jsdom.
vi.mock('~components/Dashboard/Booker', () => ({
  BookerModalButton: ({ children }: { children?: React.ReactNode }) => <button>{children}</button>,
}))

import { useSubscription } from '~components/Auth/Subscription'

const mockSub = (overrides = {}) => vi.mocked(useSubscription).mockReturnValue({ loading: false, ...overrides } as any)

describe('IntegratorSubscriptionTab', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the current plan, status and a Change plan action', () => {
    mockSub({
      subscription: {
        plan: { name: 'Free', default: true, monthlyPrice: 0, yearlyPrice: 0 },
        subscriptionDetails: { active: true },
      },
    })

    render(<IntegratorSubscriptionTab />)

    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Change plan')).toBeInTheDocument()
    // Free plan: no billing portal button
    expect(screen.queryByText('Billing details')).not.toBeInTheDocument()
  })

  it('shows Billing details for paid plans', () => {
    mockSub({
      subscription: {
        plan: { name: 'Pro', default: false, monthlyPrice: 10, yearlyPrice: 100 },
        subscriptionDetails: { active: true },
      },
    })

    render(<IntegratorSubscriptionTab />)

    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Billing details')).toBeInTheDocument()
  })

  it('renders an info alert when subscription data is unavailable', () => {
    mockSub({ subscription: undefined })

    render(<IntegratorSubscriptionTab />)

    expect(screen.getByText('Subscription details are unavailable')).toBeInTheDocument()
  })
})
