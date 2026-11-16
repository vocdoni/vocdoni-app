import { render } from '~src/test-utils'
import { KeyHint } from './KeyHint'

describe('KeyHint', () => {
  it('renders a decorative kbd', () => {
    const { container } = render(<KeyHint>N</KeyHint>)
    const key = container.querySelector('kbd')

    expect(key).toHaveTextContent('N')
    expect(key).toHaveAttribute('aria-hidden', 'true')
  })
})
