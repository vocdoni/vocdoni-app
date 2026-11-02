import { render, screen } from '~src/test-utils'
import { DragHandle } from './DragHandle'

describe('DragHandle', () => {
  it('has a default accessible name', () => {
    render(<DragHandle placement='start' role='button' />)

    expect(screen.getByRole('button', { name: 'Drag to reorder' })).toBeInTheDocument()
  })

  it('lets a caller give a more specific name', () => {
    render(<DragHandle placement='start' role='button' aria-label='Reorder question 2' />)

    expect(screen.getByRole('button', { name: 'Reorder question 2' })).toBeInTheDocument()
  })
})
