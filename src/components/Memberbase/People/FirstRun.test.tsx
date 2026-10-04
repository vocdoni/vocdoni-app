import userEvent from '@testing-library/user-event'
import { render, screen } from '~src/test-utils'
import { Door, FirstRun } from './FirstRun'

const affected = vi.hoisted(() => ({ hasActive: false }))

const download = vi.hoisted(() => vi.fn())
vi.mock('~utils/download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/download')>()),
  downloadBlob: download,
}))

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

  it('downloads the Excel template', async () => {
    affected.hasActive = false
    render(<FirstRun onImport={vi.fn()} onAddPeople={vi.fn()} />)

    await userEvent.click(screen.getByRole('button', { name: 'Get the template' }))

    expect(download).toHaveBeenCalledWith(expect.any(Blob), 'members-template.xlsx')
  })
})
