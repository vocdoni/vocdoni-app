import { render, screen } from '~src/test-utils'
import { StatusBadge, type StatusBadgeColor, type StatusBadgeSize } from './StatusBadge'

const emotionCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n')

describe('StatusBadge', () => {
  it.each<StatusBadgeSize>(['xs', 'sm', 'md', 'lg'])('renders its label at size %s', (size) => {
    render(
      <StatusBadge colorPalette='success' size={size}>
        Active
      </StatusBadge>
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each<StatusBadgeColor>(['success', 'warning', 'danger', 'info', 'gray'])('paints the %s palette', (colorPalette) => {
    render(<StatusBadge colorPalette={colorPalette}>Label</StatusBadge>)
    const chip = screen.getByText('Label')

    const painted = Array.from(chip.classList).some((name) =>
      new RegExp(`\\.${name}[^{]*\\{[^}]*--chakra-colors-${colorPalette}-`).test(emotionCss())
    )
    expect(painted).toBe(true)
  })

  it('passes layout props through to the chip', () => {
    render(
      <StatusBadge colorPalette='warning' size='sm' data-testid='chip' flexShrink={0}>
        Pending
      </StatusBadge>
    )

    expect(screen.getByTestId('chip')).toHaveTextContent('Pending')
  })
})
