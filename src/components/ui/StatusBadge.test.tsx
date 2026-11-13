import { render, screen } from '~src/test-utils'
import { StatusBadge, type StatusBadgeColor } from './StatusBadge'

const emotionCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n')

describe('StatusBadge', () => {
  it('renders its label', () => {
    render(<StatusBadge colorPalette='success'>Active</StatusBadge>)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  // Each palette picks a tone; the dot and the word are painted from its status roles (grey for info and gray).
  it.each<[StatusBadgeColor, string]>([
    ['success', 'status-success'],
    ['warning', 'status-warning'],
    ['danger', 'status-error'],
    ['info', 'fg-subtle'],
    ['gray', 'fg-subtle'],
  ])('paints the %s palette from %s', (colorPalette, role) => {
    render(<StatusBadge colorPalette={colorPalette}>Label</StatusBadge>)
    const root = screen.getByText('Label').parentElement as HTMLElement
    const dot = root.firstElementChild as HTMLElement

    const painted = Array.from(dot.classList).some((name) =>
      new RegExp(`\\.${name}[^{]*\\{[^}]*--chakra-colors-${role}`).test(emotionCss())
    )
    expect(painted).toBe(true)
  })

  it('is a dot and a word, never a filled chip', () => {
    render(
      <StatusBadge colorPalette='success' variant='solid'>
        Live
      </StatusBadge>
    )
    const root = screen.getByText('Live').parentElement as HTMLElement

    expect(root.firstElementChild).toBeEmptyDOMElement()
    expect(emotionCss()).not.toMatch(new RegExp(`\\.${root.classList[0]}[^{]*\\{[^}]*background`))
  })

  it('keeps a trailing icon outside the clamped label', () => {
    render(
      <StatusBadge colorPalette='info' endElement={<svg data-testid='icon' />}>
        Live results
      </StatusBadge>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Live results')).not.toContainElement(screen.getByTestId('icon'))
  })

  it('passes layout props through to the chip', () => {
    render(
      <StatusBadge colorPalette='warning' data-testid='chip' flexShrink={0}>
        Pending
      </StatusBadge>
    )

    expect(screen.getByTestId('chip')).toHaveTextContent('Pending')
  })
})
