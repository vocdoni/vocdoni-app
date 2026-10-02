import userEvent from '@testing-library/user-event'
import { fireEvent, mockUseOrganization, render, screen, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AddToGroupSheet, AddToVoteSheet, RemoveFromGroupSheet, SaveAsCensusSheet, UNDO_DURATION } from './BulkActions'
import type { SelectedMember } from './useSelection'

const mocks = vi.hoisted(() => ({
  groups: [] as { id: string; title: string; membersCount: number; isAutoGroup?: boolean; censusIds?: string[] }[],
  updateGroup: vi.fn(),
  createGroup: vi.fn(),
  deleteGroup: vi.fn(),
  toast: vi.fn(),
  fetch: vi.fn(),
  navigate: vi.fn(),
  voteOwned: new Set<string>(),
  addCensusMembers: vi.fn(),
  waitFor: vi.fn(),
  processes: [] as unknown[],
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({
    client: {
      elections: {
        list: async () => ({ processes: mocks.processes, pagination: {} }),
        addCensusMembers: mocks.addCensusMembers,
      },
      jobs: { waitFor: mocks.waitFor },
    },
  }),
}))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => mocks.navigate,
}))

vi.mock('~src/queries/voteGroups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/voteGroups')>()),
  useVoteGroupMarkers: () => ({
    markers: new Map(),
    ready: true,
    isVoteOwned: (id?: string) => !!id && mocks.voteOwned.has(id),
  }),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: mocks.fetch, currentAddress: '0xorg' }),
}))

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => mocks.toast,
}))

vi.mock('~src/queries/groups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/groups')>()),
  useAllGroups: () => ({ data: mocks.groups, isLoading: false }),
  useUpdateGroup: () => ({ mutateAsync: mocks.updateGroup, isPending: false }),
  useUpdateGroupWithReport: () => ({ mutateAsync: mocks.updateGroup, isPending: false }),
  useCreateGroup: () => ({ mutateAsync: mocks.createGroup, isPending: false }),
  useDeleteGroup: () => ({ mutate: mocks.deleteGroup, isPending: false }),
}))

const person = (index: number) => ({ id: `m${index}`, name: `Person ${index}` }) as SelectedMember
const anna = { id: 'a1', name: 'Anna', surname: 'Vila' } as SelectedMember
const jordi = { id: 'j2', name: 'Jordi', surname: 'Serra' } as SelectedMember

const pickGroup = async (user: ReturnType<typeof userEvent.setup>, title: string) => {
  await user.click(screen.getByRole('combobox'))
  await user.click(screen.getByRole('option', { name: new RegExp(title) }))
}

describe('bulk action sheets', () => {
  beforeEach(() => {
    // Seven saved censuses: more than the first page the old picker loaded
    mocks.groups = [
      { id: 'all', title: 'Everyone', membersCount: 9, isAutoGroup: true },
      ...Array.from({ length: 7 }, (_, index) => ({ id: `g${index}`, title: `Census ${index + 1}`, membersCount: 1 })),
    ]
    Object.values(mocks).forEach((mock) => typeof mock === 'function' && mock.mockReset())
    mocks.voteOwned = new Set()
    mocks.updateGroup.mockResolvedValue(undefined)
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
  })

  it('saves the selection as a census, with an 8-second Undo that deletes it', async () => {
    const user = userEvent.setup()
    mocks.createGroup.mockResolvedValue({ id: 'new-group' })
    const onOpenChange = vi.fn()
    render(<SaveAsCensusSheet open onOpenChange={onOpenChange} members={[anna, jordi]} />)

    // The name is required
    await user.click(screen.getByRole('button', { name: 'Save census' }))
    expect(mocks.createGroup).not.toHaveBeenCalled()

    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Quota pagada ')
    await user.click(screen.getByRole('button', { name: 'Save census' }))

    await waitFor(() =>
      expect(mocks.createGroup).toHaveBeenCalledWith({
        title: 'Quota pagada',
        description: '',
        memberIds: ['a1', 'j2'],
        source: 'selection',
        size: 2,
      })
    )
    const saved = mocks.toast.mock.calls[0][0]
    expect(saved).toMatchObject({ title: 'Saved as “Quota pagada”', duration: UNDO_DURATION })
    expect(onOpenChange).toHaveBeenCalledWith(false)

    saved.action.onClick()
    expect(mocks.deleteGroup).toHaveBeenCalledWith('new-group', expect.anything())

    // The toast also leads to the new census
    render(saved.description)
    // The sheet is still open in this test, so the page behind it takes no pointer events
    fireEvent.click(screen.getByRole('button', { name: 'Open the census' }))
    expect(mocks.navigate).toHaveBeenCalledWith('/admin/memberbase/censuses/new-group')
  })

  it('saves everyone through includeAllMembers, without sending ids', async () => {
    const user = userEvent.setup()
    mocks.createGroup.mockResolvedValue({ id: 'snapshot' })
    render(<SaveAsCensusSheet open onOpenChange={vi.fn()} members={[]} everyone={1742} />)

    expect(screen.getByText('Everyone in your members (1,742)')).toBeInTheDocument()
    await user.type(screen.getByRole('textbox', { name: /Name/ }), 'Tothom')
    await user.click(screen.getByRole('button', { name: 'Save census' }))

    await waitFor(() => expect(mocks.createGroup).toHaveBeenCalled())
    const sent = mocks.createGroup.mock.calls[0][0]
    expect(sent).toMatchObject({ includeAllMembers: true, size: 1742 })
    expect(sent).not.toHaveProperty('memberIds')
    expect(mocks.fetch).not.toHaveBeenCalled()
  })

  it('offers every saved census, never "Everyone"', async () => {
    const user = userEvent.setup()
    render(<AddToGroupSheet open onOpenChange={vi.fn()} members={[anna]} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(
      Array.from({ length: 7 }, (_, index) => `Census ${index + 1}1`)
    )
    expect(screen.queryByRole('option', { name: /Everyone/ })).toBeNull()
  })

  it('never offers a vote’s own census among the saved ones', async () => {
    const user = userEvent.setup()
    mocks.voteOwned = new Set(['g0'])
    render(<RemoveFromGroupSheet open onOpenChange={vi.fn()} members={[anna]} />)

    await user.click(screen.getByRole('combobox'))
    expect(screen.queryByRole('option', { name: /Census 1/ })).toBeNull()
    expect(screen.getAllByRole('option')).toHaveLength(6)
  })

  it('adds people to a vote with a census of its own through that census, so the two never drift apart', async () => {
    const user = userEvent.setup()
    mocks.voteOwned = new Set(['owned'])
    mocks.updateGroup.mockResolvedValue({ censusJobIds: ['job-1'] })
    mocks.processes = [
      { id: 'p1', title: { default: 'Assemblea' }, census: { groupId: 'owned' }, questions: [{ status: 'ONGOING' }] },
    ]
    render(<AddToVoteSheet open onOpenChange={vi.fn()} members={[anna, jordi]} />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Assemblea' }))
    await user.click(screen.getByRole('button', { name: 'Add 2 people' }))

    await waitFor(() =>
      expect(mocks.updateGroup).toHaveBeenCalledWith({ groupId: 'owned', body: { addMembers: ['a1', 'j2'] } })
    )
    expect(mocks.addCensusMembers).not.toHaveBeenCalled()
    await waitFor(() => expect(mocks.waitFor).toHaveBeenCalledWith('job-1', expect.anything()))
  })

  it('adds a big selection to a saved census 500 at a time', async () => {
    const user = userEvent.setup()
    const members = Array.from({ length: 1200 }, (_, index) => person(index))
    render(<AddToGroupSheet open onOpenChange={vi.fn()} members={members} />)

    await pickGroup(user, 'Census 7')
    await user.click(screen.getByRole('button', { name: 'Add 1,200 people' }))

    await waitFor(() => expect(mocks.updateGroup).toHaveBeenCalledTimes(3))
    expect(mocks.updateGroup.mock.calls.map(([{ groupId, body }]) => [groupId, body.addMembers.length])).toEqual([
      ['g6', 500],
      ['g6', 500],
      ['g6', 200],
    ])
    expect(mocks.toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Added to “Census 7”' }))
  })

  it('removes people from a saved census, saying they stay in the members', async () => {
    const user = userEvent.setup()
    mocks.groups[1].censusIds = ['census-of-a-vote']
    const onDone = vi.fn()
    render(<RemoveFromGroupSheet open onOpenChange={vi.fn()} members={[anna, jordi]} onDone={onDone} />)

    expect(screen.getByText('They stay in your members.')).toBeInTheDocument()
    await pickGroup(user, 'Census 1')
    expect(
      screen.getByText('If a vote uses this saved census, they’re removed from that vote’s census too.')
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove 2 people' }))

    await waitFor(() =>
      expect(mocks.updateGroup).toHaveBeenCalledWith({ groupId: 'g0', body: { removeMembers: ['a1', 'j2'] } })
    )
    expect(onDone).toHaveBeenCalled()
  })

  it('collects every member first when everyone is selected', async () => {
    const user = userEvent.setup()
    mocks.fetch.mockResolvedValue({
      members: [{ id: 'x1' }, { id: 'x2' }, { id: 'x3' }],
      pagination: { totalItems: 3, lastPage: 1 },
    })
    render(<AddToGroupSheet open onOpenChange={vi.fn()} members={[]} everyone={3} />)

    await pickGroup(user, 'Census 2')
    await user.click(screen.getByRole('button', { name: 'Add 3 people' }))

    await waitFor(() =>
      expect(mocks.updateGroup).toHaveBeenCalledWith({ groupId: 'g1', body: { addMembers: ['x1', 'x2', 'x3'] } })
    )
    expect(mocks.fetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=100&search=')
  })
})
