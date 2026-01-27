import { render, screen } from '~src/test-utils'
import { NoResultsFiltering } from './NoResultsFiltering'

describe('NoResultsFiltering', () => {
  it('renders the empty state message', () => {
    render(<NoResultsFiltering />)

    expect(screen.getByText('Your current search filter returns no results')).toBeInTheDocument()
  })
})
