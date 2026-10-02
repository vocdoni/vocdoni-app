import userEvent from '@testing-library/user-event'
import { ApiError } from '~components/Auth/api'
import { render, screen } from '~src/test-utils'
import { DeleteAllMembersDialog, DeleteMembersDialog } from './DeleteMembersDialog'
import type { SelectedMember } from './useSelection'

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  votes: [] as { id: string; title: string; state: string }[],
  track: vi.fn(),
}))

vi.mock('~src/queries/members', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/members')>()
  return { ...actual, useDeleteMembers: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }) }
})

vi.mock('~src/queries/affectedVotes', () => ({
  useAffectedVotes: () => ({ votes: mocks.votes, hasActive: false, hasLive: false, isLoading: false }),
}))

vi.mock('~utils/analytics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~utils/analytics')>()
  return { ...actual, trackAnalyticsEvent: mocks.track }
})

const anna = { id: 'a1', name: 'Anna', surname: 'Vila Puig' } as SelectedMember
const jordi = { id: 'j2', name: 'Jordi', surname: 'Serra Mas' } as SelectedMember

const conflict = (signedMemberIds: string[]) =>
  new ApiError(
    { error: 'member already signed', data: { signedMemberIds } } as never,
    new Response(null, { status: 409 })
  )

describe('DeleteMembersDialog', () => {
  beforeEach(() => {
    mocks.mutateAsync.mockReset()
    mocks.track.mockReset()
    mocks.votes = [
      { id: 'v1', title: 'Assemblea General 2026', state: 'live' },
      { id: 'v2', title: 'Eleccions Junta 2025', state: 'closed' },
    ]
  })

  it('names the votes the delete reaches', () => {
    render(<DeleteMembersDialog open onOpenChange={vi.fn()} members={[anna, jordi]} scope='selection' />)

    expect(screen.getByText('Delete 2 people from members?')).toBeInTheDocument()
    expect(
      screen.getByText(
        "This also removes them from: Assemblea General 2026 (live) · Eleccions Junta 2025 (closed) and any other census they're in."
      )
    ).toBeInTheDocument()
  })

  it('says who blocked the delete and offers to delete the others', async () => {
    const user = userEvent.setup()
    const onDeleted = vi.fn()
    mocks.mutateAsync.mockRejectedValueOnce(conflict(['a1'])).mockResolvedValueOnce(undefined)
    render(
      <DeleteMembersDialog
        open
        onOpenChange={vi.fn()}
        members={[anna, jordi]}
        scope='selection'
        onDeleted={onDeleted}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Delete 2' }))
    expect(mocks.mutateAsync).toHaveBeenCalledWith({ ids: ['a1', 'j2'] })
    expect(await screen.findByText('Nobody was deleted')).toBeInTheDocument()
    expect(screen.getByText(/Anna Vila Puig has already started voting in a live vote\./)).toBeInTheDocument()
    expect(mocks.track).toHaveBeenCalledWith({
      name: 'members_deleted',
      props: { count: 0, scope: 'selection', blocked: true },
    })

    await user.click(screen.getByRole('button', { name: 'Delete the other one' }))
    expect(mocks.mutateAsync).toHaveBeenLastCalledWith({ ids: ['j2'] })
    expect(onDeleted).toHaveBeenCalledWith(['j2'])
  })

  it('only offers to close when everyone was blocked', async () => {
    const user = userEvent.setup()
    mocks.mutateAsync.mockRejectedValueOnce(conflict(['a1']))
    render(<DeleteMembersDialog open onOpenChange={vi.fn()} members={[anna]} scope='single' />)

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(await screen.findByText('Nobody was deleted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Delete the other/ })).toBeNull()
  })
})

describe('DeleteAllMembersDialog', () => {
  beforeEach(() => {
    mocks.mutateAsync.mockReset()
    mocks.votes = []
  })

  it('needs the member count typed before it deletes everyone', async () => {
    const user = userEvent.setup()
    mocks.mutateAsync.mockResolvedValue(undefined)
    render(<DeleteAllMembersDialog open onOpenChange={vi.fn()} total={1742} />)

    expect(screen.getByText('Delete all 1,742 members?')).toBeInTheDocument()
    expect(screen.getByText('This deletes everyone in your members, whatever your search shows.')).toBeInTheDocument()
    const confirm = screen.getByRole('button', { name: 'Delete all members' })
    expect(confirm).toBeDisabled()

    await user.type(screen.getByRole('textbox', { name: 'Type 1742 to confirm' }), '1742')
    expect(confirm).toBeEnabled()
    await user.click(confirm)
    expect(mocks.mutateAsync).toHaveBeenCalledWith({ all: true })
  })

  it('reports a delete-all a live vote blocked', async () => {
    const user = userEvent.setup()
    mocks.mutateAsync.mockRejectedValueOnce(conflict(['a1', 'j2']))
    render(<DeleteAllMembersDialog open onOpenChange={vi.fn()} total={12} />)

    await user.type(screen.getByRole('textbox', { name: 'Type 12 to confirm' }), '12')
    await user.click(screen.getByRole('button', { name: 'Delete all members' }))
    expect(await screen.findByText(/2 people have already started voting in a live vote\./)).toBeInTheDocument()
  })
})
