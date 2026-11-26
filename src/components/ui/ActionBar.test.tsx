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

  it('has the main action described by the note when asked to', () => {
    render(
      <ActionBar
        label='Accions'
        primary={<button>Emet el vot</button>}
        note='Un cop emès no es pot canviar.'
        noteDescribesPrimary
        credit={credit}
      />
    )

    expect(screen.getByRole('button', { name: 'Emet el vot' })).toHaveAccessibleDescription(
      'Un cop emès no es pot canviar.'
    )
  })

  it('leaves the main action undescribed unless asked, so a note that is an action is not read out', () => {
    render(
      <ActionBar
        label='Accions'
        primary={<button>Mostra els resultats</button>}
        note={<button>No ets tu? Surt</button>}
        credit={credit}
      />
    )

    expect(screen.getByRole('button', { name: 'Mostra els resultats' })).not.toHaveAttribute('aria-describedby')
  })

  it('keeps an aria-describedby the main action already has, and adds the note after it', () => {
    render(
      <ActionBar
        label='Accions'
        primary={<button aria-describedby='hint'>Emet el vot</button>}
        note='Un cop emès no es pot canviar.'
        noteDescribesPrimary
        credit={credit}
      />
    )

    const ids = screen.getByRole('button', { name: 'Emet el vot' }).getAttribute('aria-describedby')?.split(' ')
    expect(ids).toHaveLength(2)
    expect(ids?.[0]).toBe('hint')
    expect(document.getElementById(ids?.[1] ?? '')).toHaveTextContent('Un cop emès no es pot canviar.')
  })

  it('adds no aria-describedby without a note, even when asked', () => {
    render(<ActionBar label='Accions' primary={<button>Continua</button>} noteDescribesPrimary credit={credit} />)

    expect(screen.getByRole('button', { name: 'Continua' })).not.toHaveAttribute('aria-describedby')
  })

  it('leaves out what it is not given', () => {
    render(<ActionBar label='Accions' secondary={<button>Surt</button>} credit={credit} />)

    const region = screen.getByRole('region', { name: 'Accions' })
    expect(within(region).getAllByRole('button')).toHaveLength(1)
    expect(region.children).toHaveLength(2)
  })

  it('holds its note in a block, so a block inside it never lands in a paragraph (conformance D-19)', () => {
    render(<ActionBar label='Accions' note={<div>En pausa</div>} credit={credit} />)

    const note = within(screen.getByRole('region', { name: 'Accions' })).getByText('En pausa')
    expect(note.parentElement?.tagName).toBe('DIV')
    expect(note.closest('p')).toBeNull()
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
