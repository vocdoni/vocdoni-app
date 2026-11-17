import { render, screen, within } from '~src/test-utils'
import { ActionBar } from './ActionBar'
import { VoterShell } from './VoterShell'

const credit = <p>Votació feta amb Vocdoni</p>

describe('ActionBar', () => {
  it('is a named region with the way back first, the main action, the note and the credit', () => {
    render(
      <ActionBar
        label='Accions'
        secondary={<button>Enrere</button>}
        primary={<button>Emet el vot</button>}
        note='Un cop emès no es pot canviar.'
        credit={credit}
      />
    )

    const region = screen.getByRole('region', { name: 'Accions' })
    expect(
      within(region)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Enrere', 'Emet el vot'])
    expect(within(region).getByText('Un cop emès no es pot canviar.')).toBeInTheDocument()
    expect(within(region).getByText('Votació feta amb Vocdoni')).toBeInTheDocument()
  })

  it('leaves out what it is not given', () => {
    render(<ActionBar label='Accions' secondary={<button>Surt</button>} credit={credit} />)

    const region = screen.getByRole('region', { name: 'Accions' })
    expect(within(region).getAllByRole('button')).toHaveLength(1)
    expect(region.querySelector('p + p')).toBeNull()
  })

  it('marks itself so the voter shell keeps clear of it and hands it the credit', () => {
    render(
      <VoterShell name='Ateneu' credit={{ text: 'Votació feta amb', brand: 'Vocdoni' }}>
        <ActionBar label='Accions' primary={<button>Continua</button>} credit={credit} />
      </VoterShell>
    )

    const region = screen.getByRole('region', { name: 'Accions' })
    expect(region).toHaveAttribute('data-scope', 'action-bar')
    expect(region).toHaveAttribute('data-part', 'root')
    expect(screen.getByRole('main')).toContainElement(region)
  })
})
