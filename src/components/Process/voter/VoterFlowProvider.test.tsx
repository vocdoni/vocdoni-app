import { act, render, waitFor } from '@testing-library/react'
import { AllProviders } from '~src/test-utils'
import { useVoterFlow, type VoterFlow } from './flow-context'
import { VoterFlowProvider } from './VoterFlowProvider'

// The SDK hooks the provider reads, stubbed: here only what `cast` does with a `vote()` that throws matters.
const sdk = vi.hoisted(() => ({
  vote: vi.fn(async (_values: Record<string, unknown>): Promise<string | false> => 'vote-1'),
}))
vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  // Built here: importing test-flow from this factory would import this mocked module again and never resolve.
  const election = {
    id: 'p1',
    title: { default: 'Assemblea' },
    description: { default: '' },
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2099-12-01T19:00:00.000Z',
    census: { authFields: ['memberNumber'], twoFaFields: [], weighted: false, anonymous: false },
    questions: [1, 2].map((n) => ({
      id: `q${n}`,
      title: { default: `Question ${n}` },
      choices: [
        { title: { default: 'Yes' }, value: 0 },
        { title: { default: 'No' }, value: 1 },
      ],
      type: 'singlechoice',
      status: 'ONGOING',
    })),
  }
  const fmethods = {
    watch: () => ({ unsubscribe: () => undefined }),
    setValue: () => undefined,
    reset: () => undefined,
    trigger: async () => true,
    formState: { errors: {} },
  }
  // One value for every render, as the SDK's state is between changes.
  const state = {
    election,
    status: 'ONGOING',
    connected: true,
    authToken: 'tok',
    check: async () => ({
      belongsToProcess: true,
      questions: election.questions.map((question) => ({
        questionId: question.id,
        canVote: true,
        hasVoted: false,
        hasSigned: false,
      })),
    }),
    clearVoter: () => undefined,
    voting: false,
    // Both questions are on chain, so the flow counts them answered and `cast` reaches `vote()`.
    voteStatus: { q1: 'confirmed', q2: 'confirmed' },
    pendingVotes: {},
    voterQuestions: election.questions.map((question) => ({ questionId: question.id, hasVoted: false })),
    hasVoted: false,
    isAbleToVote: true,
    voteIds: {},
    weight: null,
  }
  const form = { fmethods, vote: (values: Record<string, unknown>) => sdk.vote(values) }
  return {
    ...actual,
    useElection: () => state,
    useQuestionsForm: () => form,
  }
})
vi.mock('~components/Process/CSP/CSPStepsProvider', () => ({
  useCspAuthContext: () => ({ currentStep: 0, resetFlow: () => undefined }),
}))

const probe: { current?: VoterFlow } = {}
const Probe = () => {
  probe.current = useVoterFlow()
  return null
}

describe('VoterFlowProvider cast', () => {
  it('reports an exception from vote() on review instead of leaving it unhandled (gate F14)', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    sdk.vote.mockRejectedValueOnce(new Error('boom'))
    render(
      <AllProviders>
        <VoterFlowProvider brand={{ branded: false, name: 'Ateneu' }}>
          <Probe />
        </VoterFlowProvider>
      </AllProviders>
    )
    await waitFor(() => expect(probe.current).toBeDefined())
    await act(async () => {
      await probe.current?.cast()
    })
    expect(sdk.vote).toHaveBeenCalledTimes(1)
    // An empty message: review shows the SDK's own generic sentence.
    expect(probe.current?.state.castError).toBe('')
    expect(probe.current?.casting).toBe(false)
    expect(logged).toHaveBeenCalledWith('Voter cast failed:', expect.any(Error))
    logged.mockRestore()
  })
})
