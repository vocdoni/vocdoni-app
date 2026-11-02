import { render, screen } from '~src/test-utils'
import { WhatsAppButton } from './WhatsappButton'

// The anchor carries role='group' (it drives the hover label), so it is queried by that role.
describe('WhatsAppButton', () => {
  it('names the link even when the label is not rendered', () => {
    render(<WhatsAppButton noExpand />)

    expect(screen.getByRole('group', { name: 'Talk with us!' })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/')
    )
  })

  it('keeps the same name when the hover label is rendered', () => {
    render(<WhatsAppButton />)

    expect(screen.getByRole('group', { name: 'Talk with us!' })).toBeInTheDocument()
  })
})
