import { render, screen } from '~src/test-utils'
import { CensusRuler } from './CensusRuler'

const NAME = '184 of 312 people voted, 59%'

describe('CensusRuler', () => {
  it('names the bar and prints the scale', () => {
    render(<CensusRuler value={184} max={312} label={NAME} />)

    expect(screen.getByRole('progressbar', { name: NAME })).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('312')).toBeInTheDocument()
  })

  it('prints only 0 and the total, never the count', () => {
    render(<CensusRuler value={184} max={312} label={NAME} />)

    expect(screen.queryByText('184')).not.toBeInTheDocument()
  })

  it('caps the fill at the total', () => {
    render(<CensusRuler value={400} max={312} label='turnout' />)

    expect(screen.getByRole('progressbar', { name: 'turnout' })).toHaveAttribute('aria-valuenow', '100')
  })

  it('has no scale without a census', () => {
    render(<CensusRuler value={5} label='5 people voted' />)

    expect(screen.getByRole('progressbar', { name: '5 people voted' })).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
