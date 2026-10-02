import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router'
import { mockUseOrganization } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useMembersCount, usePaginatedMembers } from './members'

const bearedFetch = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={['/admin/memberbase/members/1']}>{children}</MemoryRouter>
  </QueryClientProvider>
)

describe('member queries', () => {
  beforeEach(() => {
    bearedFetch.mockReset()
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
  })

  afterEach(() => {
    resetReactProvidersMock()
  })

  it('counts the memberbase with a one-row request', async () => {
    bearedFetch.mockResolvedValue({ members: [{}], pagination: { totalItems: 1742 } })
    const { result } = renderHook(() => useMembersCount(), { wrapper })

    await waitFor(() => expect(result.current.known).toBe(true))
    expect(result.current.count).toBe(1742)
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=1')
  })

  it('encodes the search term', async () => {
    bearedFetch.mockResolvedValue({ members: [], pagination: { totalItems: 0 } })
    renderHook(() => usePaginatedMembers({ search: 'a+b@x.org & co' }), { wrapper })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith(
      'organizations/0xorg/members?page=1&limit=10&search=a%2Bb%40x.org%20%26%20co'
    )
  })

  it('asks the server for the page, size and sort it is given', async () => {
    bearedFetch.mockResolvedValue({ members: [], pagination: { totalItems: 0 } })
    renderHook(() => usePaginatedMembers({ search: '', page: 3, limit: 50, sortBy: 'surname', sortOrder: 'desc' }), {
      wrapper,
    })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith(
      'organizations/0xorg/members?page=3&limit=50&search=&sortBy=surname&sortOrder=desc'
    )
  })
})
