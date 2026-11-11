import { render, screen } from '~src/test-utils'
import Footer from './Footer'

describe('Footer', () => {
  it('names each social link, since its icon is hidden from assistive tech', () => {
    render(<Footer />)

    expect(screen.getByRole('link', { name: 'link.twitter' })).toHaveAttribute('href', 'https://twitter.com/vocdoni')
    expect(screen.getByRole('link', { name: 'link.discord' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'link.github' })).toBeInTheDocument()
  })
})
