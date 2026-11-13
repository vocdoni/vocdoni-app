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

  it.each<StatusBadgeColor>(['success', 'warning', 'danger', 'info', 'gray'])(
    'paints the %s palette',
    (colorPalette) => {
      render(<StatusBadge colorPalette={colorPalette}>Label</StatusBadge>)
      const chip = screen.getByText('Label').parentElement as HTMLElement

      const painted = Array.from(chip.classList).some((name) =>
        new RegExp(`\\.${name}[^{]*\\{[^}]*--chakra-colors-${colorPalette}-`).test(emotionCss())
      )
      expect(painted).toBe(true)
    }
  )

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
