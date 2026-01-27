import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PaginationProvider } from '@vocdoni/react-providers'
import { Pagination } from './Pagination'

const pagination = { lastPage: 10, totalItems: 100 }

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
