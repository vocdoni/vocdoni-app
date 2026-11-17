import { render, screen } from '~src/test-utils'
import { StepProgress } from './StepProgress'

describe('StepProgress', () => {
  it('shows the label and a progress bar named by it, as far as the questions reached', () => {
    render(<StepProgress label='Pregunta 2 de 4' value={2} total={4} />)

    expect(screen.getByText('Pregunta 2 de 4')).toHaveAttribute('aria-live', 'polite')
    const bar = screen.getByRole('progressbar', { name: 'Pregunta 2 de 4', hidden: true })
    // The label is what is read: the bar is hidden from assistive tech (F10), so queries need `hidden`.
    expect(bar.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(bar).toHaveAttribute('aria-valuenow', '2')
    expect(bar).toHaveAttribute('aria-valuemax', '4')
  })

  it('fills the line on the review', () => {
    render(<StepProgress label='Revisió' value={4} total={4} />)

    expect(screen.getByRole('progressbar', { name: 'Revisió', hidden: true })).toHaveAttribute('aria-valuenow', '4')
  })

  it('never runs past the total', () => {
    render(<StepProgress label='Revisió' value={6} total={4} />)

    expect(screen.getByRole('progressbar', { hidden: true })).toHaveAttribute('aria-valuenow', '4')
  })

  it('renders nothing for a one-question vote', () => {
    render(<StepProgress label='Pregunta 1 de 1' value={1} total={1} />)

    expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument()
    expect(screen.queryByText('Pregunta 1 de 1')).not.toBeInTheDocument()
  })
})
