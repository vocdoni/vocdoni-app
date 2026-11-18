import { render, screen, within } from '~src/test-utils'
import { VoterCredit, VoterShell } from './VoterShell'

const credit = { text: 'Votació feta amb', brand: 'Vocdoni' }

describe('VoterShell', () => {
  it('shows the organisation with the Vocdoni symbol, the actions, the column and the credit', () => {
    render(
      <VoterShell name='Ateneu de Vallnova' actions={<button>CA</button>} credit={credit}>
        <h1>Assemblea General Ordinària 2026</h1>
      </VoterShell>
    )

    const banner = screen.getByRole('banner')
    expect(within(banner).getByText('Ateneu de Vallnova')).toBeInTheDocument()
    expect(banner.querySelector('svg[aria-hidden]')).not.toBeNull()
    expect(within(banner).getByRole('button', { name: 'CA' })).toBeInTheDocument()
    expect(within(screen.getByRole('main')).getByRole('heading', { name: /Assemblea/ })).toBeInTheDocument()
    expect(within(screen.getByRole('contentinfo')).getByRole('img', { name: 'Vocdoni' })).toBeInTheDocument()
    expect(screen.getByText('Votació feta amb')).toBeInTheDocument()
  })

  it('shows the organisation logo instead of the symbol when given', () => {
    render(
      <VoterShell name='Ateneu de Vallnova' logo={<img alt='Ateneu de Vallnova' src='logo.png' />} credit={credit}>
        <p>content</p>
      </VoterShell>
    )

    const banner = screen.getByRole('banner')
    expect(within(banner).getByRole('img', { name: 'Ateneu de Vallnova' })).toBeInTheDocument()
    expect(banner.querySelector('svg')).toBeNull()
  })

  it('has no strip and no rail on a screen without the agenda', () => {
    render(
      <VoterShell name='Ateneu' credit={credit}>
        <p>content</p>
      </VoterShell>
    )

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
    expect(document.querySelector('[data-part="strip"]')).toBeNull()
  })

  it('puts the vote head in the strip with the progress, and in the named rail over the agenda', () => {
    render(
      <VoterShell
        name='Ateneu'
        head={{ title: 'Assemblea General Ordinària 2026', status: <span>Oberta fins dijous</span> }}
        progress={<div>Pregunta 1 de 4</div>}
        rail={<ol aria-label='steps' />}
        railLabel='Ordre del dia'
        column='rail'
        credit={credit}
      >
        <p>content</p>
      </VoterShell>
    )

    const strip = document.querySelector('[data-part="strip"]') as HTMLElement
    expect(within(strip).getByText('Assemblea General Ordinària 2026')).toBeInTheDocument()
    expect(within(strip).getByText('Pregunta 1 de 4')).toBeInTheDocument()
    const rail = screen.getByRole('complementary', { name: 'Ordre del dia' })
    expect(within(rail).getByText('Assemblea General Ordinària 2026')).toBeInTheDocument()
    expect(within(rail).getByText('Oberta fins dijous')).toBeInTheDocument()
    expect(within(rail).getByRole('list', { name: 'steps' })).toBeInTheDocument()
  })

  it('marks its column and foot so an action bar can take the credit', () => {
    render(
      <VoterShell name='Ateneu' credit={credit}>
        <p>content</p>
      </VoterShell>
    )

    expect(screen.getByRole('main')).toHaveAttribute('data-part', 'main')
    expect(screen.getByRole('contentinfo')).toHaveAttribute('data-part', 'foot')
  })
})

describe('VoterCredit', () => {
  it('reads the words and the wordmark by its name', () => {
    render(<VoterCredit {...credit} />)

    expect(screen.getByText('Votació feta amb')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Vocdoni' })).toBeInTheDocument()
  })
})
