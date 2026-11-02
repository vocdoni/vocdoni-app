import { render, screen } from '~src/test-utils'
import { SubscriptionPlans } from './Plans'

vi.mock('~components/Auth/Subscription', () => ({ useSubscription: () => ({ subscription: null, error: null }) }))
vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: () => Promise.resolve([]) }),
}))
vi.mock('./use-subscription-checkout', () => ({ useSubscriptionCheckout: () => ({ showCheckout: vi.fn() }) }))
vi.mock('./Card', () => ({ default: () => <p>Plan card</p> }))

describe('SubscriptionPlans', () => {
  it('renders the plan cards in the panel the selected billing tab controls', async () => {
    render(<SubscriptionPlans />)

    const tab = await screen.findByRole('tab', { selected: true })
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '')
    expect(panel).not.toBeNull()
    expect(panel).toContainElement((await screen.findAllByText('Plan card'))[0])
  })
})
