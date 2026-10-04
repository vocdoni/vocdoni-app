import { render, screen } from '~src/test-utils'
import { MaskedValue } from './MaskedValue'

describe('MaskedValue', () => {
  it('shows dots and the tail, but reads out a sentence instead', () => {
    const { container } = render(<MaskedValue label='national ID' tail='23A' />)

    expect(screen.getByText('national ID ending in 23A')).toBeInTheDocument()
    const visible = container.querySelector('[aria-hidden="true"]')
    expect(visible).toHaveTextContent('•••23A')
    expect(container.querySelector('.ph-no-capture')).not.toBeNull()
  })

  it('says the value is hidden when nothing is shown', () => {
    render(<MaskedValue label='birth date' />)

    expect(screen.getByText('birth date hidden')).toBeInTheDocument()
  })
})
