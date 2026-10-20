import { render, screen } from '~src/test-utils'
import { electionComponents } from './election'

const ElectionResults = electionComponents.ElectionResults!

describe('electionComponents.ElectionResults', () => {
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
})
