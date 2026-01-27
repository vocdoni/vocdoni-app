import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '~src/test-utils'
import Groups from './GroupsBoard'

vi.mock('~src/queries/groups', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~src/queries/groups')>()
  return {
    ...actual,
    useGroups: () => ({
      data: [],
      isLoading: false,
      isFetched: true,
      error: null,
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    }),
  }
})

describe('GroupsBoard', () => {
  it('renders an empty state when no groups exist', () => {
    render(<Groups />)

    expect(screen.getByText('No groups found')).toBeInTheDocument()
  })
})
