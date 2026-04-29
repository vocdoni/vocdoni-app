import { render, screen } from '~src/test-utils'
import userEvent from '@testing-library/user-event'
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
      title: 'All Members', // raw backend value
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
})
