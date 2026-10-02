import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { mockUseOrganization } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { getNextGroupsPageParam, useAllGroups } from './groups'

const bearedFetch = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
)

const pagination = (currentPage: number, lastPage: number) => ({
  totalItems: 0,
  previousPage: null,
  currentPage,
  nextPage: currentPage < lastPage ? currentPage + 1 : null,
  lastPage,
})

describe('getNextGroupsPageParam', () => {
  it('returns next page when current page is less than last page', () => {
    expect(getNextGroupsPageParam({ groups: [], pagination: pagination(1, 2) })).toBe(2)
  })

  it('returns undefined when current page is the last page', () => {
    expect(getNextGroupsPageParam({ groups: [], pagination: pagination(2, 2) })).toBeUndefined()
  })
})

describe('useAllGroups', () => {
  beforeEach(() => {
    bearedFetch.mockReset()
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
  })

  afterEach(() => resetReactProvidersMock())

  it('loads every page of groups, 100 at a time', async () => {
    bearedFetch.mockImplementation(async (url: string) =>
      url.includes('page=1')
        ? { groups: [{ id: 'g1' }, { id: 'g2' }], pagination: pagination(1, 2) }
        : { groups: [{ id: 'g3' }], pagination: pagination(2, 2) }
    )
    const { result } = renderHook(() => useAllGroups(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.map((group) => group.id)).toEqual(['g1', 'g2', 'g3'])
    expect(bearedFetch.mock.calls.map(([url]) => url)).toEqual([
      'organizations/0xorg/groups?page=1&limit=100',
      'organizations/0xorg/groups?page=2&limit=100',
    ])
  })
})
