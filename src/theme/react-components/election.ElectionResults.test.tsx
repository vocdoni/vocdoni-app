import { mockUseElection, render, screen } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { electionComponents } from './election'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

const ElectionResults = electionComponents.ElectionResults!

const withStatus = (status: string | null) => setReactProvidersMock({ useElection: () => mockUseElection({ status }) })

// The library passes the questions in the election's order, so the first question here is `q1`.
const withResults = (status: string, finalResults: boolean) =>
  setReactProvidersMock({
    useElection: () =>
      mockUseElection({
        status,
        election: { questions: [{ id: 'q1' }] },
        results: { questions: [{ questionId: 'q1', finalResults }] },
      }),
  })

const question = (votes: [string, string][]) => ({
  title: 'Question',
  choices: votes.map(([count, percent], index) => ({ title: `Choice ${index + 1}`, votes: count, percent })),
})

const rows = () => document.querySelectorAll('[data-leading], [data-dimmed]')

describe('electionComponents.ElectionResults', () => {
  beforeEach(() => resetReactProvidersMock())

  it('renders the tally and a bar for each decoded choice', () => {
    render(
      <ElectionResults
        questions={[
          {
            title: 'Question',
            choices: [
              { title: 'Yes', votes: '7', percent: '70%' },
              { title: 'No', votes: '3', percent: '30%' },
            ],
          },
        ]}
      />
    )

    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getAllByText('results.votes')).toHaveLength(2)
    expect(screen.getAllByRole('progressbar')).toHaveLength(2)
  })

  // react-components returns empty votes/percent for a question whose ballot type can't be inferred
  // (e.g. a legacy process with no type nor ballotProtocol). That is "no tally", not a zero tally.
  it('lists the choices without a tally when votes are empty', () => {
    render(
      <ElectionResults
        questions={[
          {
            title: 'Legacy question',
            choices: [
              { title: 'Yes', votes: '', percent: '' },
              { title: 'No', votes: '', percent: '' },
            ],
          },
        ]}
      />
    )

    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('No')).toBeInTheDocument()
    expect(screen.queryByText('results.votes')).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  describe('final result', () => {
    it('keeps every bar in full ink while the vote is live', () => {
      withStatus('ONGOING')
      render(
        <ElectionResults
          questions={[
            question([
              ['7', '70%'],
              ['3', '30%'],
            ]),
          ]}
        />
      )

      expect(rows()).toHaveLength(0)
    })

    it('keeps every bar in full ink at the end of the vote until the tally is final', () => {
      withResults('ENDED', false)
      render(
        <ElectionResults
          questions={[
            question([
              ['7', '70%'],
              ['3', '30%'],
            ]),
          ]}
        />
      )

      expect(rows()).toHaveLength(0)
    })

    it('highlights the leading choice, without a tick, and dims the others once the tally is final', () => {
      withResults('ENDED', true)
      render(
        <ElectionResults
          questions={[
            question([
              ['7', '70%'],
              ['2', '20%'],
              ['1', '10%'],
            ]),
          ]}
        />
      )

      const leading = document.querySelectorAll('[data-leading]')
      expect(leading).toHaveLength(1)
      expect(leading[0]).toHaveTextContent('Choice 1')
      expect(document.querySelectorAll('svg')).toHaveLength(0)
      expect(document.querySelectorAll('[data-dimmed]')).toHaveLength(2)
    })

    it('marks and dims nothing on a tie at the top', () => {
      withStatus('ENDED')
      render(
        <ElectionResults
          questions={[
            question([
              ['4', '40%'],
              ['4', '40%'],
              ['2', '20%'],
            ]),
          ]}
        />
      )

      expect(rows()).toHaveLength(0)
    })

    it('marks and dims nothing when nobody voted', () => {
      withStatus('ENDED')
      render(
        <ElectionResults
          questions={[
            question([
              ['0', '0%'],
              ['0', '0%'],
            ]),
          ]}
        />
      )

      expect(rows()).toHaveLength(0)
    })
  })
})
