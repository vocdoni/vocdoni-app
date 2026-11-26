import { render } from '~src/test-utils'
import { SuccessDisc } from './SuccessDisc'

describe('SuccessDisc', () => {
  it('draws a tick hidden from screen readers', () => {
    render(<SuccessDisc />)

    const disc = document.querySelector('[data-part="success-disc"]') as HTMLElement
    expect(disc).toHaveAttribute('aria-hidden', 'true')
    expect(disc.querySelector('svg')).not.toBeNull()
  })
})
