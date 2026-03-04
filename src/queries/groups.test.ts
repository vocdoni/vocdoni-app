import { describe, expect, it } from 'vitest'
import { getNextGroupsPageParam } from './groups'

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
