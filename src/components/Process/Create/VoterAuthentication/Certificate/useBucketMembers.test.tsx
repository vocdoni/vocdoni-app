import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AllProviders } from '~src/test-utils'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useBucketMembers } from './useBucketMembers'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

vi.mock('@vocdoni/react-components', async (importActual) => {
  const actual = await importActual<typeof import('@vocdoni/react-components')>()
  return { ...actual, useOrganization: () => ({ organization: { address: '0xorg' } }) }
})

const wrapper = ({ children }: { children: ReactNode }) => <AllProviders>{children}</AllProviders>

const makeBearedFetch = (pages: Array<{ members: { id: string; name: string; nationalId: string }[] }>) =>
  vi.fn().mockImplementation((url: string) => {
    const match = url.match(/page=(\d+)/)
    const pageNum = match ? parseInt(match[1], 10) : 1
    const page = pages[pageNum - 1] ?? pages[pages.length - 1]
    return Promise.resolve({
      members: page.members,
      pagination: { currentPage: pageNum, lastPage: pages.length, totalItems: 0, previousPage: null, nextPage: null },
    })
  })

describe('useBucketMembers', () => {
  beforeEach(() => {
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
  })

  it('does nothing while enabled is false', async () => {
    const bearedFetch = vi.fn()
    setAuthMock({ bearedFetch })

    const { result } = renderHook(() => useBucketMembers('grp1', ['id1'], false), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(bearedFetch).not.toHaveBeenCalled()
  })

  it('fetches page=1 and page=2 when two pages are needed, then returns a Map id → member', async () => {
    const bearedFetch = makeBearedFetch([
      { members: [{ id: 'id1', name: 'Alice', nationalId: '12345678Z' }] },
      { members: [{ id: 'id2', name: 'Bob', nationalId: '87654321X' }] },
    ])
    setAuthMock({ bearedFetch })

    const { result } = renderHook(() => useBucketMembers('grp1', ['id1', 'id2'], true), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/groups/grp1/members?page=1&limit=100')
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/groups/grp1/members?page=2&limit=100')
    expect(bearedFetch).toHaveBeenCalledTimes(2)

    const data = result.current.data!
    expect(data).toBeInstanceOf(Map)
    expect(data.get('id1')).toMatchObject({ id: 'id1', name: 'Alice' })
    expect(data.get('id2')).toMatchObject({ id: 'id2', name: 'Bob' })
  })

  it('stops early once every requested id is found', async () => {
    // id1 is on page 1; id2 never appears on any page but would be on page 2.
    // Both ids requested: hook should stop after finding id1 and id2 both found on page 1.
    const bearedFetch = makeBearedFetch([
      {
        members: [
          { id: 'id1', name: 'Alice', nationalId: '12345678Z' },
          { id: 'id2', name: 'Bob', nationalId: '87654321X' },
        ],
      },
      { members: [] },
    ])
    setAuthMock({ bearedFetch })

    const { result } = renderHook(() => useBucketMembers('grp1', ['id1', 'id2'], true), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    // Both found on page 1, page 2 never fetched.
    expect(bearedFetch).toHaveBeenCalledTimes(1)
  })
})
