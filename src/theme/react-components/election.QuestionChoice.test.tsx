import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { electionComponents } from './election'

const QuestionChoice = electionComponents.QuestionChoice!

describe('electionComponents.QuestionChoice', () => {
  it('renders extended metadata content when presentation is extended', () => {
    render(
      <QuestionChoice
        choice={{ value: 1, title: { default: 'With skin' } } as any}
        value='1'
        label='With skin'
        selected={false}
        disabled={false}
        controlType='radio'
        presentation='extended'
        selectionMode='single'
        compact={false}
        hasImage={true}
        canOpenImageModal={true}
        dataAttrs={{ 'data-layout': 'grid' }}
        description='Detailed explanation'
        image={{ default: 'https://example.com/kiwi.jpg', thumbnail: 'https://example.com/kiwi-thumb.jpg' }}
        onSelect={() => {}}
      />
    )

    expect(screen.getByText('Detailed explanation')).toBeInTheDocument()
    expect(screen.getByAltText('With skin')).toBeInTheDocument()
  })

  it('renders radio for single and checkbox for multiple', () => {
    const { rerender } = render(
      <QuestionChoice
        choice={{ value: 1, title: { default: 'Choice' } } as any}
        value='1'
        label='Choice'
        selected={false}
        disabled={false}
        controlType='radio'
        presentation='basic'
        selectionMode='single'
        compact={true}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        onSelect={() => {}}
      />
    )

    expect(document.querySelector('input[type="radio"]')).toBeInTheDocument()
    expect(document.querySelector('[data-control-type="radio"]')).toBeInTheDocument()

    rerender(
      <QuestionChoice
        choice={{ value: 2, title: { default: 'Choice 2' } } as any}
        value='2'
        label='Choice 2'
        selected={false}
        disabled={false}
        controlType='checkbox'
        presentation='basic'
        selectionMode='multiple'
        compact={true}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        onSelect={() => {}}
      />
    )

    expect(document.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    expect(document.querySelector('[data-control-type="checkbox"]')).toBeInTheDocument()
  })

  it('draws keyboard focus on the visible radio circle, since the native input is invisible', () => {
    render(
      <QuestionChoice
        choice={{ value: 1, title: { default: 'Choice' } } as any}
        value='1'
        label='Choice'
        selected={false}
        disabled={false}
        controlType='radio'
        presentation='basic'
        selectionMode='single'
        compact={true}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        onSelect={() => {}}
      />
    )

    const input = document.querySelector<HTMLInputElement>('input[type="radio"]')!
    const circle = input.nextElementSibling as HTMLElement
    const css = Array.from(document.querySelectorAll('style'))
      .map((style) => style.textContent)
      .join('\n')
    const focusRule = Array.from(circle.classList).some((name) =>
      css.includes(`.peer:is(:focus-visible, [data-focus-visible])~.${name}`)
    )

    expect(input).toHaveClass('peer')
    expect(focusRule).toBe(true)
  })

  it('opens the image in a modal from a focusable button without selecting the choice', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <QuestionChoice
        choice={{ value: 1, title: { default: 'With skin' } } as any}
        value='1'
        label='With skin'
        selected={false}
        disabled={false}
        controlType='radio'
        presentation='basic'
        selectionMode='single'
        compact={false}
        hasImage={true}
        canOpenImageModal={true}
        dataAttrs={{ 'data-layout': 'grid' }}
        image={{ default: 'https://example.com/kiwi.jpg', thumbnail: 'https://example.com/kiwi-thumb.jpg' }}
        onSelect={onSelect}
      />
    )

    const button = screen.getByRole('button', { name: 'With skin' })
    button.focus()
    await user.keyboard('{Enter}')

    expect(await screen.findByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('leaves the image inert when it cannot be opened', () => {
    render(
      <QuestionChoice
        choice={{ value: 1, title: { default: 'With skin' } } as any}
        value='1'
        label='With skin'
        selected={false}
        disabled={false}
        controlType='radio'
        presentation='basic'
        selectionMode='single'
        compact={false}
        hasImage={true}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'grid' }}
        image={{ default: 'https://example.com/kiwi.jpg' }}
        onSelect={() => {}}
      />
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
