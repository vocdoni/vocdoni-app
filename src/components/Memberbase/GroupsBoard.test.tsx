import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import Groups from './GroupsBoard'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

let mockUseGroupsData = []

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
    useDeleteGroup: () => ({ mutate: vi.fn() }),
    useUpdateGroup: () => ({ mutate: vi.fn() }),
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
