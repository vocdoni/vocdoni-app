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

  it('prints the count under the fill with a marker', () => {
    render(<CensusRuler value={184} max={312} label={NAME} marker />)

    expect(screen.getByText('184')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('hides the start label when the fill is short enough to cover it', () => {
    render(<CensusRuler value={10} max={312} label='10 of 312 people voted, 3%' marker />)

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('has no scale without a census', () => {
    render(<CensusRuler value={5} label='5 people voted' />)

    expect(screen.getByRole('progressbar', { name: '5 people voted' })).toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })
})
