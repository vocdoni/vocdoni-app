import { render, screen } from '~src/test-utils'
import { ProcessStatus, type ProcessStatusState } from './ProcessStatus'

const emotionCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n')

const VOTE: [ProcessStatusState, string][] = [
  ['draft', 'Draft'],
  ['ready', 'Ready'],
  ['live', 'Live'],
  ['paused', 'Paused'],
  ['closed', 'Closed'],
  ['canceled', 'Canceled'],
]

const QUESTION: [ProcessStatusState, string][] = [
  ['toOpen', 'To open'],
  ['open', 'Open'],
  ['paused', 'Paused'],
  ['closed', 'Closed'],
  ['canceled', 'Voided'],
  ['notOpened', 'Not opened'],
]

// The dot's classes carry the role it is painted with.
const dotPaints = (word: string, pattern: string) => {
  const root = screen.getByText(word).parentElement as HTMLElement
  const dot = root.firstElementChild as HTMLElement
  return Array.from(dot.classList).some((name) => new RegExp(`\\.${name}[^{]*\\{[^}]*${pattern}`).test(emotionCss()))
}

describe('ProcessStatus', () => {
  it.each(VOTE)('words a vote that is %s as %s', (state, word) => {
    render(<ProcessStatus state={state} />)

    expect(screen.getByText(word)).toBeInTheDocument()
  })

  it.each(QUESTION)('words a question that is %s as %s', (state, word) => {
    render(<ProcessStatus state={state} kind='question' />)

    expect(screen.getByText(word)).toBeInTheDocument()
  })

  it.each<[ProcessStatusState, string, string]>([
    ['live', 'Live', '--chakra-colors-status-success'],
    ['paused', 'Paused', '--chakra-colors-status-warning'],
    ['canceled', 'Canceled', '--chakra-colors-status-error'],
    ['closed', 'Closed', '--chakra-colors-fg-subtle'],
    ['ready', 'Ready', '--chakra-colors-fg\\)'],
    ['draft', 'Draft', 'inset 0 0 0'],
  ])('paints %s from its role', (state, word, pattern) => {
    render(<ProcessStatus state={state} />)

    expect(dotPaints(word, pattern)).toBe(true)
  })

  it.each<[ProcessStatusState, string]>([
    ['canceled', 'Voided'],
    ['notOpened', 'Not opened'],
  ])('draws a %s question hollow, not red', (state, word) => {
    render(<ProcessStatus state={state} kind='question' />)

    expect(dotPaints(word, 'inset 0 0 0')).toBe(true)
  })
})
