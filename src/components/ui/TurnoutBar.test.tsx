import { render, screen } from '~src/test-utils'
import { TurnoutBar } from './TurnoutBar'

describe('TurnoutBar', () => {
  it('prints the caption and share over a ruler named by the label', () => {
    render(<TurnoutBar caption='184 of 312 voted' share='59%' value={184} max={312} label='184 of 312 people voted' />)

    expect(screen.getByText('184 of 312 voted')).toBeInTheDocument()
    expect(screen.getByText('59%')).toBeInTheDocument()
    expect(screen.getByRole('progressbar', { name: '184 of 312 people voted' })).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('312')).toBeInTheDocument()
  })

  it('passes the ruler props through', () => {
    render(<TurnoutBar caption='400 of 312 voted' value={400} max={312} label='turnout' />)

    expect(screen.getByRole('progressbar', { name: 'turnout' })).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText('312')).toBeInTheDocument()
  })
})
