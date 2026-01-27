import { describe, it, expect } from 'vitest'
import { PaginationProvider } from '@vocdoni/react-providers'
import { render } from '~src/test-utils'
import { Pagination } from './Pagination'

const pagination = { lastPage: 10, totalItems: 100, previousPage: 0, currentPage: 1, nextPage: 2 }

describe('Pagination', () => {
  it('renders buttons', () => {
    const { getByText } = render(
      <PaginationProvider pagination={pagination} initialPage={1}>
        <Pagination pagination={pagination} />
      </PaginationProvider>
    )
    expect(getByText('1')).toBeTruthy()
  })
})
