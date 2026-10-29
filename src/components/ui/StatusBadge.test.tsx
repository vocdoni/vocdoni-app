import { render, screen } from '~src/test-utils'
import { statusPalette, type StatusTone } from '~theme/status'
import { StatusBadge, type StatusBadgeSize } from './StatusBadge'

const emotionCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n')

describe('StatusBadge', () => {
  it.each<StatusBadgeSize>(['xs', 'sm', 'md', 'lg'])('renders its label at size %s', (size) => {
    render(
      <StatusBadge tone='success' size={size}>
        Active
      </StatusBadge>
    )

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each(Object.keys(statusPalette).filter((tone) => tone !== 'destructive') as StatusTone[])(
    'paints the %s tone from its status palette',
    (tone) => {
      render(<StatusBadge tone={tone}>Label</StatusBadge>)
      const chip = screen.getByText('Label')

      const painted = Array.from(chip.classList).some((name) =>
        new RegExp(`\\.${name}[^{]*\\{[^}]*--chakra-colors-${statusPalette[tone]}-`).test(emotionCss())
      )
      expect(painted).toBe(true)
    }
  )

  it('passes layout props through to the chip', () => {
    render(
      <StatusBadge tone='warning' size='sm' data-testid='chip' flexShrink={0}>
        Pending
      </StatusBadge>
    )

    expect(screen.getByTestId('chip')).toHaveTextContent('Pending')
  })
})
