import { fireEvent, render, screen } from '~src/test-utils'
import { electionComponents } from './election'

const QuestionRankChoice = electionComponents.QuestionRankChoice!

const options = [
  { position: 1, label: '1', taken: false },
  { position: 2, label: '2', taken: true },
  { position: 3, label: '3', taken: false },
]

describe('electionComponents.QuestionRankChoice', () => {
  it('renders the description as markdown, never as raw HTML', () => {
    render(
      <QuestionRankChoice
        choice={{ value: 1, title: { default: 'Option' } } as any}
        value='1'
        label='Option'
        description={'<img src=x onerror="alert(1)">'}
        presentation='extended'
        compact={false}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        position={null}
        options={options}
        onRank={() => {}}
      />
    )

    expect(document.querySelector('[onerror]')).toBeNull()
    expect(document.querySelector('label img')).toBeNull()
    expect(screen.getByText('<img src=x onerror="alert(1)">')).toBeInTheDocument()
  })

  it('renders a ranking select with one option per position plus the empty option', () => {
    render(
      <QuestionRankChoice
        choice={{ value: 1, title: { default: 'Option' } } as any}
        value='1'
        label='Option'
        presentation='basic'
        compact={true}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        position={2}
        options={options}
        onRank={() => {}}
      />
    )

    const select = document.querySelector<HTMLSelectElement>('select')!
    expect(select).toHaveValue('2')
    expect(select.querySelectorAll('option')).toHaveLength(options.length + 1)
  })

  it('disables the ranking select when the choice is disabled', () => {
    render(
      <QuestionRankChoice
        choice={{ value: 1, title: { default: 'Option' } } as any}
        value='1'
        label='Option'
        presentation='basic'
        compact={true}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        position={null}
        options={options}
        onRank={() => {}}
        disabled
      />
    )

    expect(document.querySelector('select')).toBeDisabled()
  })

  it('reports the chosen position as a number, or null when cleared', () => {
    const onRank = vi.fn()
    render(
      <QuestionRankChoice
        choice={{ value: 1, title: { default: 'Option' } } as any}
        value='1'
        label='Option'
        presentation='basic'
        compact={true}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        position={null}
        options={options}
        onRank={onRank}
      />
    )

    const select = document.querySelector<HTMLSelectElement>('select')!
    fireEvent.change(select, { target: { value: '3' } })
    expect(onRank).toHaveBeenLastCalledWith(3)

    fireEvent.change(select, { target: { value: '' } })
    expect(onRank).toHaveBeenLastCalledWith(null)
  })

  it('starts with the empty option and marks taken positions', () => {
    render(
      <QuestionRankChoice
        choice={{ value: 1, title: { default: 'Option' } } as any}
        value='1'
        label='Option'
        presentation='basic'
        compact={true}
        hasImage={false}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        position={null}
        options={options}
        onRank={() => {}}
      />
    )

    const renderedOptions = document.querySelectorAll<HTMLOptionElement>('select option')
    expect(renderedOptions[0]).toHaveValue('')
    expect(renderedOptions[0]).toHaveTextContent('—')
    expect(renderedOptions[2]).toHaveAttribute('data-taken')
    expect(renderedOptions[1]).not.toHaveAttribute('data-taken')
  })

  it('resolves ipfs:// choice images to a gateway URL', () => {
    render(
      <QuestionRankChoice
        choice={{ value: 1, title: { default: 'Option' } } as any}
        value='1'
        label='Option'
        presentation='basic'
        compact={true}
        hasImage={true}
        canOpenImageModal={false}
        dataAttrs={{ 'data-layout': 'list' }}
        image={{ default: 'ipfs://bafybeigdyrzt' }}
        position={null}
        options={options}
        onRank={() => {}}
      />
    )

    const img = screen.getByAltText('Option')
    expect(img.getAttribute('src')).toContain('bafybeigdyrzt')
    expect(img.getAttribute('src')).not.toMatch(/^ipfs:/)
  })
})
