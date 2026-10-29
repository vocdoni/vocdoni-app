import { ApiErrorCode } from '@vocdoni/api-client'
import userEvent from '@testing-library/user-event'
import { ApiError } from '~components/Auth/api'
import { render, screen, waitFor } from '~src/test-utils'
import { InviteToTeamModal } from './Invite'

const mutation = vi.hoisted(() => ({ mutate: vi.fn() }))
const toast = vi.hoisted(() => vi.fn())

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => toast,
}))

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
    mutate: mutation.mutate,
    isPending: false,
  }),
}))

vi.mock('~components/Form/InputBasic', () => ({
  default: () => <div>InputBasic</div>,
}))

// Registers a role so the form can submit without rendering the real selector
vi.mock('~components/Layout/SaasSelector', async () => {
  const { useFormContext } = await import('react-hook-form')
  const { useEffect } = await import('react')
  return {
    RoleSelector: () => {
      const { setValue } = useFormContext()
      useEffect(() => setValue('role', { value: 'manager' }), [setValue])
      return <div>RoleSelector</div>
    },
  }
})

describe('InviteToTeamModal', () => {
  it('renders the invite button with the icon', () => {
    render(<InviteToTeamModal leftIcon={<span data-testid='invite-icon' />}>Invite</InviteToTeamModal>)

    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument()
    expect(screen.getByTestId('invite-icon')).toBeInTheDocument()
  })

  it('explains a team with its admin and manager limit reached in the invite error toast', async () => {
    const user = userEvent.setup()
    mutation.mutate.mockImplementation((_body, options) =>
      options.onError(
        new ApiError(
          { error: 'raw backend message', code: ApiErrorCode.MaxWritersReached },
          new Response(null, { status: 400 })
        )
      )
    )
    render(<InviteToTeamModal>Invite</InviteToTeamModal>)

    await user.click(screen.getByRole('button', { name: 'Invite' }))
    await user.click(await screen.findByRole('button', { name: 'Send invitation' }))

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          description: expect.stringContaining('already has 5 admins and managers'),
        })
      )
    )
  })
})
