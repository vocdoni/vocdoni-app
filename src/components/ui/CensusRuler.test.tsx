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

  it.each([
    [10, '10'],
    [300, '300'],
    [312, '312'],
  ])('always prints 0 and the total, whatever the count (%i)', (value, count) => {
    render(<CensusRuler value={value} max={312} label='turnout' marker />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getAllByText('312').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(count).length).toBeGreaterThanOrEqual(1)
  })

  it('ends the count at the fill, kept clear of 0 and of the total', () => {
    render(<CensusRuler value={1234} max={2000} label='turnout' marker />)

    // jsdom does not lay out: check the position handed to the browser.
    const css = [...document.querySelectorAll('style')].map((style) => style.textContent).join('')
    expect(css).toContain('clamp(7ch, 61.7%, calc(100% - 6ch))')
  })

  it('marks and labels the quorum when given', () => {
    render(<CensusRuler value={184} max={312} quorum={156} label={NAME} />)

    expect(screen.getByText('quorum 156')).toBeInTheDocument()
    expect(document.querySelector('[data-part="quorum"]')).not.toBeNull()
  })

  it('has no quorum without one', () => {
    render(<CensusRuler value={184} max={312} label={NAME} />)

    expect(screen.queryByText(/quorum/)).not.toBeInTheDocument()
    expect(document.querySelector('[data-part="quorum"]')).toBeNull()
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
