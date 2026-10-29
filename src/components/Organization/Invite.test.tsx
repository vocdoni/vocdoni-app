import { ApiErrorCode } from '@vocdoni/api-client'
import userEvent from '@testing-library/user-event'
import { ApiError } from '~components/Auth/api'
import { render, screen, waitFor } from '~src/test-utils'
import { InviteToTeamModal } from './Invite'

const mutation = vi.hoisted(() => ({ mutate: vi.fn() }))
const toast = vi.hoisted(() => vi.fn())
const team = vi.hoisted(() => ({ users: [] as Array<{ role: string; id?: string; email?: string }> }))

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => toast,
}))

vi.mock('./Team', () => ({
  useAllUsers: () => ({
    users: team.users,
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

// Registers a role so the form can submit without rendering the real selector, and reports which
// roles the invite form disables
vi.mock('~components/Layout/SaasSelector', async () => {
  const { useFormContext } = await import('react-hook-form')
  const { useEffect } = await import('react')
  return {
    RoleSelector: ({ isOptionDisabled, helper }) => {
      const { setValue } = useFormContext()
      useEffect(() => setValue('role', { value: 'manager' }), [setValue])
      return (
        <div>
          RoleSelector
          {['admin', 'manager', 'viewer'].map((value) => (
            <span
              key={value}
              data-testid={`role-${value}`}
              data-disabled={String(!!isOptionDisabled?.({ value, label: value }))}
            />
          ))}
          {helper && <p>{helper}</p>}
        </div>
      )
    },
  }
})

const writer = (role: 'admin' | 'manager', id: string, expiration?: string) => ({
  role,
  id,
  email: `${id}@example.com`,
  expiration,
})
const activeWriter = (role: 'admin' | 'manager', id: string) => ({
  role,
  info: { id: 1, email: `${id}@example.com`, firstName: '', lastName: '' },
})
const viewer = (id: string) => ({ role: 'viewer', id, email: `${id}@example.com` })

describe('InviteToTeamModal', () => {
  beforeEach(() => {
    team.users = []
  })

  it('renders the invite button with the icon', () => {
    render(<InviteToTeamModal leftIcon={<span data-testid='invite-icon' />}>Invite</InviteToTeamModal>)

    expect(screen.getByRole('button', { name: /invite/i })).toBeInTheDocument()
    expect(screen.getByTestId('invite-icon')).toBeInTheDocument()
  })

  it('still opens for a team at the admin and manager limit, offering viewers only', async () => {
    const user = userEvent.setup()
    // Four active writers and a pending manager invitation fill the five slots
    team.users = [
      writer('admin', 'a'),
      writer('manager', 'b'),
      writer('manager', 'c'),
      writer('admin', 'd'),
      writer('manager', 'pending'),
    ]
    render(<InviteToTeamModal>Invite</InviteToTeamModal>)

    await user.click(screen.getByRole('button', { name: 'Invite' }))

    expect(await screen.findByText('Add team member')).toBeInTheDocument()
    expect(screen.getByTestId('role-admin')).toHaveAttribute('data-disabled', 'true')
    expect(screen.getByTestId('role-manager')).toHaveAttribute('data-disabled', 'true')
    expect(screen.getByTestId('role-viewer')).toHaveAttribute('data-disabled', 'false')
    expect(screen.getByText(/Viewers are not limited/)).toBeInTheDocument()
  })

  it('frees the slot of an expired pending writer invitation', async () => {
    const user = userEvent.setup()
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    team.users = [
      activeWriter('admin', 'a'),
      activeWriter('manager', 'b'),
      activeWriter('manager', 'c'),
      activeWriter('admin', 'd'),
      writer('manager', 'expired', yesterday),
    ]
    render(<InviteToTeamModal>Invite</InviteToTeamModal>)

    await user.click(screen.getByRole('button', { name: 'Invite' }))

    expect(await screen.findByText('Add team member')).toBeInTheDocument()
    expect(screen.getByTestId('role-manager')).toHaveAttribute('data-disabled', 'false')
  })

  it('leaves admin and manager roles open while fewer than five writers exist', async () => {
    const user = userEvent.setup()
    // Viewers never count, so five viewers still leave room for a writer
    team.users = [
      writer('admin', 'a'),
      writer('manager', 'b'),
      writer('manager', 'c'),
      writer('admin', 'd'),
      viewer('v1'),
      viewer('v2'),
      viewer('v3'),
      viewer('v4'),
      viewer('v5'),
    ]
    render(<InviteToTeamModal>Invite</InviteToTeamModal>)

    await user.click(screen.getByRole('button', { name: 'Invite' }))

    expect(await screen.findByText('Add team member')).toBeInTheDocument()
    expect(screen.getByTestId('role-manager')).toHaveAttribute('data-disabled', 'false')
    expect(screen.queryByText(/Viewers are not limited/)).not.toBeInTheDocument()
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
