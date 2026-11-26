import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { render, screen } from '~src/test-utils'
import { CloseQuestionDialog } from './CloseQuestionDialog'

const question = (voteCount: number) =>
  ({
    id: 'q1',
    title: { default: 'Budget' },
    choices: [
      { title: { default: 'Yes' }, value: 0 },
      { title: { default: 'No' }, value: 1 },
    ],
    status: 'ONGOING',
    results: { voteCount },
  }) as unknown as VotingProcessQuestion

const renderDialog = (voteCount: number, last = false) =>
  render(
    <CloseQuestionDialog
      closing={{ question: question(voteCount), number: 1 }}
      last={last}
      onConfirm={vi.fn()}
      onCancel={vi.fn()}
      loading={false}
      busy={false}
    />
  )

describe('CloseQuestionDialog', () => {
  it('shows the zero-votes warning when the question has no votes', () => {
    renderDialog(0)
    expect(
      screen.getByText(/No vote has been cast yet: the question will close with no result at all\./)
    ).toBeInTheDocument()
    expect(screen.queryByText(/This is the last question/)).not.toBeInTheDocument()
  })

  it('shows only the last-question warning when the question has votes and is the last one', () => {
    renderDialog(5, true)
    expect(screen.getByText(/This is the last question: closing it closes the vote too\./)).toBeInTheDocument()
    expect(screen.queryByText(/No vote has been cast yet/)).not.toBeInTheDocument()
  })

  it('shows both warnings when the question has zero votes and is the last one', () => {
    renderDialog(0, true)
    expect(
      screen.getByText(/No vote has been cast yet: the question will close with no result at all\./)
    ).toBeInTheDocument()
    expect(screen.getByText(/This is the last question: closing it closes the vote too\./)).toBeInTheDocument()
  })

  it('shows no warning when the question has votes and is not the last one', () => {
    renderDialog(10)
    expect(screen.queryByText(/No vote has been cast yet/)).not.toBeInTheDocument()
    expect(screen.queryByText(/This is the last question/)).not.toBeInTheDocument()
  })
})
