import { render, screen } from '~src/test-utils'
import { WhatsAppButton } from './WhatsappButton'

describe('WhatsAppButton', () => {
  it('names the link even when the label is not rendered', () => {
    render(<WhatsAppButton noExpand />)

    const link = screen.getByRole('link', { name: 'Talk with us!' })
    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/'))
    // A role override would make screen readers announce a group instead of a link
    expect(link).not.toHaveAttribute('role')
  })

  it('keeps the same name when the hover label is rendered', () => {
    render(<WhatsAppButton />)

    expect(screen.getByRole('link', { name: 'Talk with us!' })).toBeInTheDocument()
  })
})
