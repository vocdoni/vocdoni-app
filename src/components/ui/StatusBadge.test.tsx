import { render, screen } from '~src/test-utils'
import { statusPalette, type StatusTone } from '~theme/status'
import { StatusBadge } from './StatusBadge'

const emotionCss = () =>
  Array.from(document.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n')

describe('StatusBadge', () => {
  it('renders its label', () => {
    render(<StatusBadge tone='success'>Active</StatusBadge>)

    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it.each(Object.keys(statusPalette).filter((tone) => tone !== 'destructive') as StatusTone[])(
    'paints the %s tone from its status palette',
    (tone) => {
      render(<StatusBadge tone={tone}>Label</StatusBadge>)
      const chip = screen.getByText('Label').parentElement as HTMLElement

      const painted = Array.from(chip.classList).some((name) =>
        new RegExp(`\\.${name}[^{]*\\{[^}]*--chakra-colors-${statusPalette[tone]}-`).test(emotionCss())
      )
      expect(painted).toBe(true)
    }
  )

  it('keeps a trailing icon outside the clamped label', () => {
    render(
      <StatusBadge tone='info' endElement={<svg data-testid='icon' />}>
        Live results
      </StatusBadge>
    )

    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('Live results')).not.toContainElement(screen.getByTestId('icon'))
  })

  it('passes layout props through to the chip', () => {
    render(
      <StatusBadge tone='warning' data-testid='chip' flexShrink={0}>
        Pending
      </StatusBadge>
    )

    expect(screen.getByTestId('chip')).toHaveTextContent('Pending')
  })
})
