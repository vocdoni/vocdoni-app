import { render, screen } from '~src/test-utils'
import { PhaseList } from './PhaseList'

describe('PhaseList', () => {
  it('lists the phases in order and marks the current one', () => {
    render(
      <PhaseList
        items={[
          { id: 'sign', label: 'Autoritzant el vot', state: 'done' },
          { id: 'send', label: 'Enviant les 4 respostes', state: 'now' },
          { id: 'confirm', label: 'Confirmant que han arribat', state: 'next' },
        ]}
      />
    )

    const rows = screen.getAllByRole('listitem')
    expect(rows.map((row) => row.textContent)).toEqual([
      'Autoritzant el vot',
      'Enviant les 4 respostes',
      'Confirmant que han arribat',
    ])
    expect(rows[1]).toHaveAttribute('aria-current', 'step')
    expect(rows[0]).not.toHaveAttribute('aria-current')
    expect(rows.map((row) => row.getAttribute('data-state'))).toEqual(['done', 'now', 'next'])
    expect(rows[1].querySelector('[aria-hidden]')).toHaveAttribute('data-state', 'now')
  })
})
