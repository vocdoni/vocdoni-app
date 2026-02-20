import { render, screen } from '~src/test-utils'
import { PaginationButton } from './Button'

describe('PaginationButton', () => {
  it('renders children', () => {
    render(<PaginationButton>1</PaginationButton>)
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
