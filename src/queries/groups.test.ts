import { createElement, type ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AllProviders, createTestQueryClient } from '~src/test-utils'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { getNextGroupsPageParam, useGroupMembers, withMembersCount } from './groups'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

describe('getNextGroupsPageParam', () => {
  it('returns next page when current page is less than last page', () => {
    const nextPage = getNextGroupsPageParam({
      groups: [],
      pagination: {
        totalItems: 7,
        previousPage: null,
        currentPage: 1,
        nextPage: 2,
        lastPage: 2,
      },
    })

    expect(nextPage).toBe(2)
  })

  it('returns undefined when current page is the last page', () => {
    const nextPage = getNextGroupsPageParam({
      groups: [],
      pagination: {
        totalItems: 7,
        previousPage: 1,
        currentPage: 2,
        nextPage: null,
        lastPage: 2,
      },
    })

    expect(nextPage).toBeUndefined()
  })
})

describe('withMembersCount', () => {
  it('counts an ordinary group from its member ids, which is all the single-group endpoint sends', () => {
    expect(withMembersCount({ id: 'g', title: 'Board', memberIds: ['a', 'b'] } as never).membersCount).toBe(2)
  })

  it('keeps the count the auto group comes with', () => {
    expect(withMembersCount({ id: 'g', title: 'All', isAutoGroup: true, membersCount: 9 } as never).membersCount).toBe(
      9
    )
  })
})

describe('useGroupMembers', () => {
  const setup = () => {
    const rows = { members: [{ id: '1' }], pagination: {} }
    const bearedFetch = vi
      .fn()
      .mockResolvedValueOnce(rows)
      .mockReturnValue(new Promise(() => {}))
    setAuthMock({ bearedFetch })
    setReactProvidersMock({ useOrganization: () => ({ organization: { address: '0xorg' } }) })
    const queryClient = createTestQueryClient()
    const wrapper = ({ children }: { children: ReactNode }) => createElement(AllProviders, { queryClient, children })
    return { rows, bearedFetch, wrapper }
  }

  it('keeps the previous rows while the next page loads', async () => {
    const { rows, bearedFetch, wrapper } = setup()
    const { result, rerender } = renderHook(({ page }) => useGroupMembers('g1', page, true), {
      wrapper,
      initialProps: { page: 1 },
    })
    await waitFor(() => expect(result.current.data).toBeDefined())

    rerender({ page: 2 })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledTimes(2))
    expect(bearedFetch).toHaveBeenLastCalledWith(expect.stringContaining('page=2'))
    expect(result.current.isPlaceholderData).toBe(true)
    expect(result.current.data).toEqual(expect.objectContaining({ members: rows.members }))
  })

  it('does not lend its rows to another group', async () => {
    const { bearedFetch, wrapper } = setup()
    const { result, rerender } = renderHook(({ id }) => useGroupMembers(id, 1, true), {
      wrapper,
      initialProps: { id: 'g1' },
    })
    await waitFor(() => expect(result.current.data).toBeDefined())

    rerender({ id: 'g2' })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalledTimes(2))
    expect(result.current.isPlaceholderData).toBe(false)
    expect(result.current.data).toBeUndefined()
  })
})
