import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import Groups from './GroupsBoard'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

let mockUseGroupsData: Array<Record<string, unknown>> = []
const mockDeleteGroupMutation = vi.fn()
const mockUpdateGroupMutation = vi.fn()

vi.mock('~src/queries/groups', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/groups')>()
  return {
    ...actual,
    useGroups: () => ({
      data: mockUseGroupsData,
      isLoading: false,
      isFetched: true,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }),
    useDeleteGroup: () => ({ mutate: mockDeleteGroupMutation }),
    useUpdateGroup: () => ({ mutate: mockUpdateGroupMutation, isPending: false }),
    useGroupMembers: () => ({
      data: {
        members: [],
        pagination: { currentPage: 1, lastPage: 1, totalItems: 0 },
      },
      isLoading: false,
      error: null,
    }),
  }
})

describe('GroupsBoard', () => {
  beforeEach(() => {
    mockUseGroupsData = []
    mockDeleteGroupMutation.mockReset()
    mockUpdateGroupMutation.mockReset()
  })

  it('renders an empty state when no groups exist', () => {
    render(<Groups />)

    expect(screen.getByText('No groups found')).toBeInTheDocument()
  })

  it('does not show delete action for auto-groups', async () => {
    const autoGroup = {
      id: 'auto-1',
      title: 'All Members',
      description: 'Auto group',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      censusIds: [],
      membersCount: 5,
      isAutoGroup: true,
    }

    mockUseGroupsData = [autoGroup]

    render(<Groups />)

    // Open the context menu for the auto-group card
    const moreButton = await screen.findByRole('button', { name: /more options/i })
    await userEvent.click(moreButton)

    // Delete action must NOT be present
    expect(screen.queryByText(/delete group/i)).not.toBeInTheDocument()
  })

  it('shows the edit action for manual groups', async () => {
    const group = {
      id: 'group-1',
      title: 'Existing group',
      description: 'Existing description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      censusIds: [],
      membersCount: 5,
      isAutoGroup: false,
    }

    mockUseGroupsData = [group]

    const user = userEvent.setup()
    render(<Groups />)

    const moreButton = await screen.findByRole('button', { name: /more options/i })
    await user.click(moreButton)

    expect(await screen.findByRole('menuitem', { name: /edit/i })).toBeInTheDocument()
  })

  it('opens the edit drawer and submits updated group details', async () => {
    const group = {
      id: 'group-1',
      title: 'Existing group',
      description: 'Existing description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      censusIds: [],
      membersCount: 5,
      isAutoGroup: false,
    }

    mockUseGroupsData = [group]

    const user = userEvent.setup()
    render(<Groups />)

    await user.click(await screen.findByRole('button', { name: /more options/i }))
    await user.click(await screen.findByRole('menuitem', { name: /edit/i }))

    const titleInput = await screen.findByRole('textbox', { name: /group name/i })
    const descriptionInput = await screen.findByRole('textbox', { name: /description/i })

    await user.clear(titleInput)
    await user.type(titleInput, 'Updated group')
    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Updated description')
    await user.click(screen.getByRole('button', { name: /save changes/i }))

    expect(mockUpdateGroupMutation).toHaveBeenCalledWith(
      {
        groupId: 'group-1',
        body: {
          title: 'Updated group',
          description: 'Updated description',
        },
      },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    )
  })

  it('renders translated title for auto-groups', async () => {
    const autoGroup = {
      id: 'auto-1',
      title: 'The backend title',
      description: 'Auto',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      censusIds: [],
      membersCount: 0,
      isAutoGroup: true,
    }

    mockUseGroupsData = [autoGroup]

    render(<Groups />)

    // The i18n key resolves to "All Members" in tests (en locale default)
    expect(await screen.findByText('All Members')).toBeInTheDocument()
  })

  it('does not show delete members button for auto-groups in member management', async () => {
    const autoGroup = {
      id: 'auto-1',
      title: 'All Members',
      description: 'Auto group',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      censusIds: [],
      membersCount: 5,
      isAutoGroup: true,
    }

    mockUseGroupsData = [autoGroup]

    render(<Groups />)

    // Open the context menu for the auto-group card
    const moreButton = await screen.findByRole('button', { name: /more options/i })
    await userEvent.click(moreButton)

    // Click on "View Members"
    const viewMembersButton = await screen.findByText(/view members/i)
    await userEvent.click(viewMembersButton)

    // Wait for the drawer to open and check that bulk action text is not present
    // For auto-groups, we should NOT see "Select members to perform bulk actions"
    expect(screen.queryByText(/select members to perform bulk actions/i)).not.toBeInTheDocument()
  })
})
