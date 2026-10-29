import { render, screen } from '~src/test-utils'
import { CloseButton } from './CloseButton'

describe('CloseButton', () => {
  it('is named through the translations, not Chakra English-only label', () => {
    render(<CloseButton />)

    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('lets a caller give a more specific name', () => {
    render(<CloseButton aria-label='Close drawer' />)

    expect(screen.getByRole('button', { name: 'Close drawer' })).toBeInTheDocument()
  })
})
