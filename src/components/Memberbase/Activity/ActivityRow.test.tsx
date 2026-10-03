import { render, screen } from '~src/test-utils'
import type { ActivityEvent } from '~src/queries/activity'
import { ActivityRow } from './ActivityRow'

const event = (label: string): ActivityEvent =>
  ({
    id: 'e1',
    type: 'process.started',
    at: '2026-10-02T10:00:00.000Z',
    actor: null,
    source: 'derived',
    subject: { type: 'process', id: 'p1', label },
    processIds: ['p1'],
  }) as ActivityEvent

describe('ActivityRow', () => {
  it('shows a name with markup in it as text, never as an element', () => {
    const label = '<strong position="fixed" inset="0">Session expired</strong> & <em>more</em>'
    const { container } = render(<ActivityRow event={event(label)} />)

    expect(screen.getByText(label)).toBeInTheDocument()
    expect(container.querySelectorAll('strong')).toHaveLength(1)
    expect(container.querySelector('em')).toBeNull()
  })
})
