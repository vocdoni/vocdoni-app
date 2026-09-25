import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { AllProviders, createTestQueryClient, TestMemoryRouter } from '~src/test-utils'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { nextMemberSort, usePaginatedMembers } from './members'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

describe('nextMemberSort', () => {
  it('starts an unsorted column ascending', () => {
    expect(nextMemberSort(null, 'name')).toEqual({ sortBy: 'name', sortOrder: 'asc' })
  })

  it('cycles the same column asc -> desc -> unsorted', () => {
    expect(nextMemberSort({ sortBy: 'email', sortOrder: 'asc' }, 'email')).toEqual({
      sortBy: 'email',
      sortOrder: 'desc',
    })
    expect(nextMemberSort({ sortBy: 'email', sortOrder: 'desc' }, 'email')).toBeNull()
  })

  it('switches to a different column ascending', () => {
    expect(nextMemberSort({ sortBy: 'name', sortOrder: 'desc' }, 'memberNumber')).toEqual({
      sortBy: 'memberNumber',
      sortOrder: 'asc',
    })
  })
})

describe('usePaginatedMembers sorting', () => {
  const renderMembersHook = (url: string, props: Parameters<typeof usePaginatedMembers>[0] = {}) => {
    const bearedFetch = vi.fn().mockResolvedValue({ members: [], pagination: {} })
    setAuthMock({ bearedFetch })
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders queryClient={queryClient}>
        <TestMemoryRouter initialEntries={[url]}>{children}</TestMemoryRouter>
      </AllProviders>
    )
    renderHook(() => usePaginatedMembers(props), { wrapper })
    return { bearedFetch, queryClient }
  }

  it('sends the URL sort to the backend and keys the cache by it', async () => {
    const { bearedFetch, queryClient } = renderMembersHook('/?limit=20&sortBy=surname&sortOrder=desc', {
      search: 'ada',
    })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith(
      'organizations/0xorg/members?page=1&limit=20&search=ada&sortBy=surname&sortOrder=desc'
    )
    const keys = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => q.queryKey)
    expect(keys).toContainEqual(expect.arrayContaining([1, 20, 'ada', 'surname', 'desc']))
  })

  it('omits the sort params when the URL has no valid sort', async () => {
    const { bearedFetch } = renderMembersHook('/?sortBy=phone&sortOrder=desc')

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=10&search=')
  })

  it('ignores the sort for showAll queries', async () => {
    const { bearedFetch } = renderMembersHook('/?sortBy=name&sortOrder=asc', { showAll: true })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=0&search=')
  })
})
