import { render, screen } from '~src/test-utils'
import type { IChoice } from '@vocdoni/sdk'
import { QuestionChoice } from './Questions'

describe('QuestionChoice', () => {
  it('adds data-no-image when no image is provided', () => {
    const choice = {
      title: { default: 'Option A' },
      value: 0,
    } as IChoice

    const { container } = render(<QuestionChoice choice={choice} layout='grid' />)
    const wrapper = container.querySelector('[data-no-image]')
    expect(wrapper?.getAttribute('data-no-image')).toBe('')
    expect(wrapper?.getAttribute('data-layout')).toBe('grid')
  })

  it('renders an image when provided', () => {
    const choice = {
      title: { default: 'Option A' },
      value: 0,
      meta: { image: { default: 'https://example.com/image.png' } },
    } as IChoice

    render(<QuestionChoice choice={choice} layout='grid' />)
    expect(screen.getByRole('img', { name: 'Option A' })).toBeTruthy()
  })
})
