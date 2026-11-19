import { render, screen } from '~src/test-utils'
import { electionComponents } from './election'

const { useElection } = vi.hoisted(() => ({ useElection: vi.fn() }))

vi.mock('@vocdoni/react-components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vocdoni/react-components')>()),
  useElection,
}))

const Voted = electionComponents.Voted!

// One entry per voted question, as the SDK builds them (the id link lives inside `description`).
const vote = (questionId: string, line: string) => ({
  questionId,
  questionTitle: '',
  voteId: 'abc',
  url: undefined,
  description: line,
})

describe('electionComponents.Voted', () => {
  beforeEach(() => {
    useElection.mockReturnValue({ election: { census: { anonymous: false } } })
  })

  it('renders the title and one line per voted question', () => {
    render(
      <Voted
        title='Your vote was successfully cast!'
        description='joined'
        votes={[vote('q1', 'First vote line'), vote('q2', 'Second vote line')]}
      />
    )

    expect(screen.getByText('Your vote was successfully cast!')).toBeInTheDocument()
    expect(screen.getByText('First vote line')).toBeInTheDocument()
    expect(screen.getByText('Second vote line')).toBeInTheDocument()
  })

  it('does not repeat the joined description on top of the per-vote lines', () => {
    render(<Voted title='Cast' description='joined' votes={[vote('q1', 'Only line')]} />)

    expect(screen.getByText('Only line')).toBeInTheDocument()
    expect(screen.queryByText('joined')).not.toBeInTheDocument()
  })

  it('says the receipt cannot be shown again for an anonymous census', () => {
    useElection.mockReturnValue({ election: { census: { anonymous: true } } })

    render(<Voted title='Cast' description='' votes={[vote('q1', 'Only line')]} />)

    expect(screen.getByText(/save this receipt now/)).toBeInTheDocument()
  })
})
