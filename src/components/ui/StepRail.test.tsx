import userEvent from '@testing-library/user-event'
import { render, screen, within } from '~src/test-utils'
import { StepRail, type StepRailItem } from './StepRail'

const items: StepRailItem[] = [
  { id: 'q1', number: '1', title: 'Comptes anuals de 2025', state: 'done', detail: 'Sí' },
  { id: 'q2', number: '2', title: 'Dues vocalies', state: 'now' },
  { id: 'q3', number: '3', title: 'Ordre de les inversions', state: 'pending' },
]

describe('StepRail', () => {
  it('lists the steps in order with their answers', () => {
    render(<StepRail items={items} />)

    const rows = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveTextContent('Comptes anuals de 2025')
    expect(within(rows[0]).getByText('Sí')).toBeInTheDocument()
  })

  it('marks the current step and shows a tick instead of the number on a done one', () => {
    render(<StepRail items={items} />)

    expect(screen.getByText('Dues vocalies').closest('[aria-current]')).toHaveAttribute('aria-current', 'step')
    const rows = screen.getAllByRole('listitem')
    expect(rows[0].querySelector('svg')).not.toBeNull()
    expect(rows[0]).not.toHaveTextContent('1')
    expect(rows[2]).toHaveTextContent('3')
    for (const [row, state] of [
      [rows[0], 'done'],
      [rows[1], 'now'],
      [rows[2], 'pending'],
    ] as const) {
      expect(row.firstElementChild).toHaveAttribute('data-state', state)
    }
  })

  it('makes a row a button when the voter can go to that step', async () => {
    const onSelect = vi.fn()
    render(<StepRail items={[{ ...items[0], onSelect }, items[1]]} />)

    await userEvent.click(screen.getByRole('button', { name: /Comptes anuals de 2025/ }))
    expect(onSelect).toHaveBeenCalledOnce()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})
