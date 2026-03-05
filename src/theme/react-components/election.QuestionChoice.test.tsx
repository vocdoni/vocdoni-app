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
})
