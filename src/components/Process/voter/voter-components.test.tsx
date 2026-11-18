import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ComponentType } from 'react'
import { AllProviders } from '~src/test-utils'
import { VoterFlowContext } from './flow-context'
import { testFlow } from './test-flow'
import { initialVoterState } from './voter-flow'
import { voterComponents } from './voter-components'

const slot = <K extends keyof typeof voterComponents>(key: K) => voterComponents[key] as ComponentType<any>
const flow = testFlow()
const tree = (ui: React.ReactElement) => (
  <AllProviders>
    <VoterFlowContext.Provider value={flow}>{ui}</VoterFlowContext.Provider>
  </AllProviders>
)
const renderSlot = (ui: React.ReactElement) => render(tree(ui))

describe('voter confirmation slots (audit F3)', () => {
  it('the shell renders the prompt bare, only while open', () => {
    const Shell = slot('ConfirmShell')
    const { rerender } = renderSlot(<Shell isOpen={false} onClose={() => {}} content={<p>prompt</p>} />)
    expect(screen.queryByText('prompt')).toBeNull()
    rerender(tree(<Shell isOpen onClose={() => {}} content={<p>prompt</p>} />))
    expect(screen.getByText('prompt')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('the confirmation confirms once on mount and draws nothing', () => {
    const Confirmation = slot('QuestionsConfirmation')
    const onConfirm = vi.fn()
    const { rerender } = renderSlot(
      <Confirmation election={{}} answers={{}} answersView={[]} onConfirm={onConfirm} onCancel={() => {}} />
    )
    rerender(
      tree(<Confirmation election={{}} answers={{}} answersView={[]} onConfirm={onConfirm} onCancel={() => {}} />)
    )
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})

describe('tap to rank (board V4VoterWide 6)', () => {
  const Rank = slot('QuestionRankChoice')
  const props = (position: number | null, taken: boolean[]): ComponentProps<typeof Rank> => ({
    choice: { title: { default: 'Teulada' }, value: 0 },
    value: '0',
    label: 'Teulada',
    compact: true,
    hasImage: false,
    canOpenImageModal: false,
    presentation: 'basic',
    position,
    options: taken.map((isTaken, i) => ({ position: i + 1, label: `#${i + 1}`, taken: isTaken })),
    onRank: vi.fn(),
  })

  it('an unranked option shows and takes the next free place', () => {
    const p = props(null, [true, false, false])
    renderSlot(<Rank {...p} />)
    const button = screen.getByRole('button', { pressed: false })
    expect(button).toHaveTextContent('2')
    fireEvent.click(button)
    expect(p.onRank).toHaveBeenCalledWith(2)
  })

  it('a ranked option gives its place back on a second tap', () => {
    const p = props(1, [false, false, false])
    renderSlot(<Rank {...p} />)
    fireEvent.click(screen.getByRole('button', { pressed: true }))
    expect(p.onRank).toHaveBeenCalledWith(null)
  })
})

describe('the voter question slot', () => {
  const Question = slot('ElectionQuestion')
  // Two of four people, with room for a blank vote (a pick-slot protocol that reserves abstain values).
  const question = {
    id: 'q2',
    title: { default: 'Qui vols a les dues vocalies?' },
    choices: [0, 1, 2, 3].map((value) => ({ title: { default: `P${value}` }, value })),
    type: 'multichoice',
    typeSetup: { maxChoices: 2, minChoices: 0, uniqueChoices: false },
    ballotProtocol: {
      maxCount: 2,
      maxValue: 5,
      maxVoteOverwrites: 0,
      costExponent: 1,
      uniqueValues: true,
      maxTotalCost: 0,
      costFromWeight: false,
    },
  }
  const renderQuestion = (answer: unknown) => {
    const flow = testFlow({
      state: { ...initialVoterState, answers: answer === undefined ? {} : { '1': answer as string[] } },
    })
    render(
      <AllProviders>
        <VoterFlowContext.Provider value={flow}>
          <Question
            question={question}
            index='1'
            layout='list'
            invalid={false}
            hasExtendedChoices={false}
            selectionMode='multiple'
            title='Qui vols a les dues vocalies?'
            fields={<div>fields</div>}
          />
        </VoterFlowContext.Provider>
      </AllProviders>
    )
    return flow
  }

  it('labels the options by the screen heading and offers a blank vote the SDK accepts', async () => {
    const flow = renderQuestion(undefined)
    expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'voter-question-1-title')
    await userEvent.click(screen.getByText('voter.question.blank'))
    expect(flow.chooseBlank).toHaveBeenCalledWith(1, true)
  })

  it('counts the choices against the limit and says when it can be left as it is', () => {
    renderQuestion(['0'])
    expect(screen.getByText('voter.question.chosen voter.question.can_leave')).toBeInTheDocument()
  })
})

describe('the voter question error slot', () => {
  const Error = slot('QuestionsError')

  it("says nothing for a question's field validation: the hint and the off button already do", () => {
    renderSlot(<Error error='Ordena les 3 opcions' variant='field' />)
    expect(screen.queryByText('Ordena les 3 opcions')).not.toBeInTheDocument()
  })

  it('still shows the form-level cast error', () => {
    renderSlot(<Error error='El vot no ha arribat' variant='form' />)
    expect(screen.getByRole('alert')).toHaveTextContent('El vot no ha arribat')
  })

  it('still shows a locked question notice, which carries the question id', () => {
    renderSlot(<Error error='Pendent de reenviar' variant='field' data-question-id='q1' />)
    expect(screen.getByRole('alert')).toHaveTextContent('Pendent de reenviar')
  })
})
