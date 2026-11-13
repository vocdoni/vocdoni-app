import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { AllProviders, createTestQueryClient, TestMemoryRouter } from '~src/test-utils'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { nextMemberSort, parseMemberSort, useMembersCount, usePaginatedMembers } from './members'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

describe('parseMemberSort', () => {
  it('reads a valid sort from the URL', () => {
    expect(parseMemberSort(new URLSearchParams('sortBy=email&sortOrder=desc'))).toEqual({
      sortBy: 'email',
      sortOrder: 'desc',
    })
  })

  it('returns null when there is no valid sort, leaving the default to the caller', () => {
    expect(parseMemberSort(new URLSearchParams(''))).toBeNull()
    expect(parseMemberSort(new URLSearchParams('sortBy=phone&sortOrder=desc'))).toBeNull()
  })
})

describe('nextMemberSort', () => {
  it('starts a column other than the active one ascending', () => {
    expect(nextMemberSort({ sortBy: 'name', sortOrder: 'asc' }, 'surname')).toEqual({
      sortBy: 'surname',
      sortOrder: 'asc',
    })
  })

  it('drops the sort instead of writing the default order explicitly', () => {
    expect(nextMemberSort({ sortBy: 'surname', sortOrder: 'desc' }, 'name')).toBeNull()
  })

  it('cycles the active column asc -> desc -> unsorted', () => {
    // The default sort (name asc) is the active one when the URL has no sort.
    expect(nextMemberSort({ sortBy: 'name', sortOrder: 'asc' }, 'name')).toEqual({
      sortBy: 'name',
      sortOrder: 'desc',
    })
    expect(nextMemberSort({ sortBy: 'name', sortOrder: 'desc' }, 'name')).toBeNull()
  })

  it('switches to a different column ascending from a descending one', () => {
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

  it('sends the URL sort to the backend', async () => {
    const { bearedFetch } = renderMembersHook('/?limit=20&sortBy=surname&sortOrder=desc', {
      search: 'ada',
    })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith(
      'organizations/0xorg/members?page=1&limit=20&search=ada&sortBy=surname&sortOrder=desc'
    )
  })

  it('fetches again with the new sort when the URL sort changes', async () => {
    const bearedFetch = vi.fn().mockResolvedValue({ members: [], pagination: {} })
    setAuthMock({ bearedFetch })
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders queryClient={queryClient}>
        <TestMemoryRouter initialEntries={['/?sortBy=surname&sortOrder=asc']}>{children}</TestMemoryRouter>
      </AllProviders>
    )
    const { result } = renderHook(() => ({ query: usePaginatedMembers({}), navigate: useNavigate() }), { wrapper })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledTimes(1))
    act(() => {
      result.current.navigate('/?sortBy=surname&sortOrder=desc')
    })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledTimes(2))
    expect(bearedFetch).toHaveBeenLastCalledWith(
      'organizations/0xorg/members?page=1&limit=10&search=&sortBy=surname&sortOrder=desc'
    )
  })

  it('keeps the sort when the search contains ? and &', async () => {
    const { bearedFetch } = renderMembersHook('/?sortBy=name&sortOrder=desc', { search: 'a?b&sortBy=email' })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith(
      'organizations/0xorg/members?page=1&limit=10&search=a%3Fb%26sortBy%3Demail&sortBy=name&sortOrder=desc'
    )
  })

  it('omits the sort params when the URL has no valid sort', async () => {
    const { bearedFetch } = renderMembersHook('/?sortBy=phone&sortOrder=desc')

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=10&search=')
  })

  it('asks for a single row and ignores the sort for count-only queries', async () => {
    const { bearedFetch } = renderMembersHook('/?page=3&limit=50&sortBy=name&sortOrder=asc', { countOnly: true })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=1&search=')
  })
})

describe('useMembersCount', () => {
  it('reads the total from pagination.totalItems of a 1-item request', async () => {
    const bearedFetch = vi.fn().mockResolvedValue({ members: [{ id: '1' }], pagination: { totalItems: 4321 } })
    setAuthMock({ bearedFetch })
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders queryClient={createTestQueryClient()}>
        <TestMemoryRouter initialEntries={['/']}>{children}</TestMemoryRouter>
      </AllProviders>
    )
    const { result } = renderHook(() => useMembersCount(), { wrapper })

    await waitFor(() => expect(result.current.total).toBe(4321))
    expect(bearedFetch).toHaveBeenCalledTimes(1)
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=1&search=')
  })
})

describe('usePaginatedMembers placeholder data', () => {
  it('keeps the current rows while the next page loads', async () => {
    const firstPage = { members: [{ id: '1', name: 'Ada' }], pagination: {} }
    const bearedFetch = vi
      .fn()
      .mockResolvedValueOnce(firstPage)
      .mockReturnValue(new Promise(() => {}))
    setAuthMock({ bearedFetch })
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders queryClient={createTestQueryClient()}>
        <TestMemoryRouter initialEntries={['/members/1']}>{children}</TestMemoryRouter>
      </AllProviders>
    )
    const { result } = renderHook(() => ({ query: usePaginatedMembers({}), navigate: useNavigate() }), { wrapper })

    await waitFor(() => expect(result.current.query.data?.members).toEqual(firstPage.members))
    // The page is a route param in the app; useParams is empty here, so the limit stands in for "another page".
    act(() => {
      result.current.navigate('/members/1?limit=20')
    })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledTimes(2))
    expect(bearedFetch).toHaveBeenLastCalledWith('organizations/0xorg/members?page=1&limit=20&search=')
    expect(result.current.query.isPlaceholderData).toBe(true)
    expect(result.current.query.data?.members).toEqual(firstPage.members)
  })

  it('keeps the current rows while a new sort loads', async () => {
    const firstPage = { members: [{ id: '1', name: 'Ada' }], pagination: {} }
    // The second request never resolves, so the hook stays in the "loading the new sort" state.
    const bearedFetch = vi
      .fn()
      .mockResolvedValueOnce(firstPage)
      .mockReturnValue(new Promise(() => {}))
    setAuthMock({ bearedFetch })
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders queryClient={queryClient}>
        <TestMemoryRouter initialEntries={['/']}>{children}</TestMemoryRouter>
      </AllProviders>
    )
    const { result } = renderHook(() => ({ query: usePaginatedMembers({}), navigate: useNavigate() }), { wrapper })

    await waitFor(() => expect(result.current.query.data?.members).toEqual(firstPage.members))
    act(() => {
      result.current.navigate('/?sortBy=name&sortOrder=asc')
    })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledTimes(2))
    expect(result.current.query.isPlaceholderData).toBe(true)
    expect(result.current.query.data?.members).toEqual(firstPage.members)
  })

  it('never lends another organization its rows, even when its search equals the new address', async () => {
    const orgARows = { members: [{ id: '1', name: 'Ada' }], pagination: {} }
    const bearedFetch = vi
      .fn()
      .mockResolvedValueOnce(orgARows)
      .mockReturnValue(new Promise(() => {}))
    setAuthMock({ bearedFetch })
    // The mock reads `address` on every call, so flipping it and rerendering switches the organization.
    let address = '0xa'
    setReactProvidersMock({ useOrganization: () => ({ organization: { address } }) })
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <AllProviders queryClient={queryClient}>
        <TestMemoryRouter initialEntries={['/']}>{children}</TestMemoryRouter>
      </AllProviders>
    )
    // Organization A is searching for the very string that is organization B's address, so B's
    // key contains A's search term and a loose "address anywhere in the key" check would match.
    const { result, rerender } = renderHook(() => usePaginatedMembers({ search: '0xb' }), { wrapper })
    await waitFor(() => expect(result.current.data?.members).toEqual(orgARows.members))

    address = '0xb'
    rerender()

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledTimes(2))
    expect(result.current.isPlaceholderData).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})
