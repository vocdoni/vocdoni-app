import { render, screen } from '~src/test-utils'
import { InviteToTeamModal } from './Invite'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    permission: () => 5,
  }),
}))

vi.mock('~components/Pricing/use-pricing-modal', () => ({
  usePricingModal: () => ({
    openModal: vi.fn(),
  }),
}))

vi.mock('./Team', () => ({
  useAllUsers: () => ({
    users: [],
    isLoading: false,
  }),
}))

vi.mock('~src/queries/organization', () => ({
  useInviteMemberMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}))

vi.mock('~components/Form/InputBasic', () => ({
  default: () => <div>InputBasic</div>,
}))

vi.mock('~components/Layout/SaasSelector', () => ({
  RoleSelector: () => <div>RoleSelector</div>,
}))

describe('InviteToTeamModal', () => {
  it('renders the invite button with the icon', () => {
    render(<InviteToTeamModal leftIcon={<span data-testid='invite-icon' />}>Invite</InviteToTeamModal>)

    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument()
    expect(screen.getByTestId('invite-icon')).toBeInTheDocument()
  })
})
