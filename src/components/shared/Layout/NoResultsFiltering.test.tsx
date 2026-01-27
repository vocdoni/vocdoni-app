import { render, screen } from '~src/test-utils'
import { describe, expect, it } from 'vitest'
import { NoResultsFiltering } from './NoResultsFiltering'

describe('NoResultsFiltering', () => {
  it('renders the empty state message', () => {
    render(<NoResultsFiltering />)

    expect(screen.getByText('Your current search filter returns no results')).toBeInTheDocument()
  })
})
