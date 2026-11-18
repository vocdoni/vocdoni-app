import { render, screen, within } from '~src/test-utils'
import { AgendaList } from './AgendaList'

describe('AgendaList', () => {
  it('is a list named by its label, with each title and its note', () => {
    render(
      <AgendaList
        label='Preguntes a votar'
        items={[
          { id: 'q1', number: '1', title: 'Comptes anuals de 2025' },
          { id: 'q2', number: '2', title: 'Dues vocalies', note: 'Fins a 2 persones' },
        ]}
      />
    )

    const list = screen.getByRole('list', { name: 'Preguntes a votar' })
    const rows = within(list).getAllByRole('listitem')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('Comptes anuals de 2025')
    expect(within(rows[1]).getByText('Fins a 2 persones')).toBeInTheDocument()
  })
})
