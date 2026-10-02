import { render, screen } from '~src/test-utils'
import { Door, FirstRun } from './FirstRun'

const affected = vi.hoisted(() => ({ hasActive: false }))

vi.mock('~src/queries/affectedVotes', () => ({
  useAffectedVotes: () => ({ votes: [], hasActive: affected.hasActive, hasLive: false, isLoading: false }),
}))

describe('FirstRun', () => {
  it('drops the "free" claim while a live or scheduled vote follows Everyone', () => {
    affected.hasActive = true
    render(<FirstRun onImport={vi.fn()} onAddPeople={vi.fn()} />)

    expect(screen.queryByText(/free and unlimited/)).toBeNull()
    expect(screen.getByText('You choose who votes in each vote.')).toBeInTheDocument()
  })

  it('has room for a third door', () => {
    affected.hasActive = false
    render(
      <FirstRun
        onImport={vi.fn()}
        onAddPeople={vi.fn()}
        extraDoor={
          <Door icon={() => null} title='Try a free test vote' description='Up to 10 people'>
            <button>Start</button>
          </Door>
        }
      />
    )

    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3)
  })
})
