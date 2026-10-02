import { render, screen } from '~src/test-utils'
import { Banner } from './Banner'

describe('Banner', () => {
  it('shows the message and its action', () => {
    render(
      <Banner status='warning' action={<button>Copy link</button>}>
        The vote closes soon.
      </Banner>
    )

    expect(screen.getByText('The vote closes soon.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
  })
})
