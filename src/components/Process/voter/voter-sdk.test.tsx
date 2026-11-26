import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import {
  ComponentsProvider,
  composeComponents,
  ConfirmProvider,
  ElectionProvider,
  electionQueryKeys,
  QuestionsFormProvider,
  useElection,
  useQuestionsForm,
} from '@vocdoni/react-components'
import { useQueryClient } from '@tanstack/react-query'
import { useReducer } from 'react'
import { AllProviders } from '~src/test-utils'
import { uiScaffoldComponents } from '~theme/react-components'
import { voterComponents } from './voter-components'
import { useOwnedAnswers } from './use-owned-answers'
import { formValuesFor, initialVoterState, voterReducer } from './voter-flow'
import { VoterFlowContext } from './flow-context'
import { QuestionScreen } from './screens/QuestionScreen'
import { testFacts, testFlow } from './test-flow'

// The real SDK everywhere: the setup file stubs react-components' hooks for component tests.
vi.mock('@vocdoni/react-components', async (importOriginal) => importOriginal())

const hex = (c: string) => c.repeat(64)
const question = (n: number, status = 'ONGOING', voteCount = 0) => ({
  id: `q${n}`,
  parentProcessId: 'p1',
  upstreamId: hex(String(n)),
  title: { default: `Question ${n}` },
  description: { default: '' },
  choices: [
    { title: { default: 'Yes' }, value: 0 },
    { title: { default: 'No' }, value: 1 },
  ],
  type: 'singlechoice',
  typeSetup: { maxChoices: 1, minChoices: 1, uniqueChoices: false },
  ballotProtocol: {
    maxCount: 1,
    maxValue: 1,
    maxVoteOverwrites: 0,
    costExponent: 1,
    uniqueValues: false,
    maxTotalCost: 0,
    costFromWeight: false,
  },
  secretUntilTheEnd: false,
  resultsShown: true,
  status,
  metadata: {},
  results: { voteCount, maxVoters: 10, finalResults: false, results: [] },
})
const process = (questions = [question(1), question(2)]) =>
  ({
    id: 'p1',
    orgAddress: 'abc',
    chainId: 'vocdoni/TEST/1',
    title: { default: 'Vote' },
    description: { default: '' },
    header: '',
    published: true,
    startDate: '2020-01-01T00:00:00.000Z',
    endDate: '2099-01-01T00:00:00.000Z',
    census: { authFields: ['memberNumber'], twoFaFields: [], weighted: false, anonymous: false },
    questions,
  }) as unknown as VotingProcessResponse

type Call = { method: string; path: string; body: any }
let calls: Call[] = []
let signBatch: (body: any) => unknown

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  calls = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = input instanceof Request ? input : new Request(String(input), init)
      const { pathname } = new URL(request.url)
      const text = await request.text()
      const body = text ? JSON.parse(text) : undefined
      calls.push({ method: request.method, path: pathname, body })
      if (pathname.endsWith('/auth/0')) return json(200, { authToken: 'tok' })
      if (pathname.endsWith('/check'))
        return json(200, {
          belongsToProcess: true,
          questions: ['q1', 'q2'].map((id, i) => ({
            questionId: id,
            upstreamId: hex(String(i + 1)),
            canVote: true,
            hasVoted: false,
            hasSigned: false,
          })),
        })
      if (pathname.endsWith('/sign-batch')) return json(200, signBatch(body))
      if (pathname === '/votes') return json(200, { jobId: 'job-1' })
      if (pathname === '/jobs/job-1')
        return json(200, {
          jobId: 'job-1',
          type: 'relay_votes',
          status: 'completed',
          result: {
            votes: [
              { status: 'completed', voteID: 'vote-1' },
              { status: 'completed', voteID: 'vote-2' },
            ],
          },
        })
      return json(404, { error: 'not found' })
    })
  )
})
afterEach(() => vi.unstubAllGlobals())

const handle: { current?: any } = {}

// What the voter page does around the SDK form: its own ComponentsProvider (the app's slots plus the voter's) and its
// own ConfirmProvider, then the SDK's QuestionsFormProvider; the answers live in the flow's reducer.
const Harness = () => {
  const [state, dispatch] = useReducer(voterReducer, initialVoterState)
  useOwnedAnswers(state.answers, state.memos, dispatch)
  const { fmethods, vote } = useQuestionsForm()
  const election = useElection()
  const queryClient = useQueryClient()
  handle.current = { state, dispatch, fmethods, vote, election, queryClient }
  return (
    <div>
      <span>answers:{JSON.stringify(state.answers)}</span>
      <span>connected:{String(election.connected)}</span>
      <span>able:{String(election.isAbleToVote)}</span>
    </div>
  )
}

// The same tree with nothing owning the answers: the SDK form alone.
const Bare = () => {
  const { fmethods } = useQuestionsForm()
  const queryClient = useQueryClient()
  handle.current = { fmethods, queryClient }
  return null
}

const renderVoter = (election = process()) =>
  render(
    <AllProviders>
      <ElectionProvider id='p1' election={election} queryOptions={{ staleTime: Infinity }}>
        <ComponentsProvider components={composeComponents(uiScaffoldComponents, voterComponents)}>
          <ConfirmProvider>
            <QuestionsFormProvider>
              <Harness />
            </QuestionsFormProvider>
          </ConfirmProvider>
        </ComponentsProvider>
      </ElectionProvider>
    </AllProviders>
  )

const identify = async () => {
  await act(() => handle.current.election.auth0({ memberNumber: '1' }))
  await screen.findByText('able:true')
}

describe('answers owned by the flow survive the SDK form reset (audit F1)', () => {
  it('keeps two answers when a poll changes a vote count, and again when a question status changes', async () => {
    renderVoter()
    act(() => {
      handle.current.fmethods.setValue('0', '1')
      handle.current.fmethods.setValue('1', '0')
    })
    await screen.findByText('answers:{"0":"1","1":"0"}')
    // A failed cast: the restores after a reset must not wipe its sentence (audit F2).
    act(() => handle.current.dispatch({ type: 'castFailed', message: 'boom' }))

    // A poll: same questions, another vote count. The SDK resets its form on the new object.
    act(() => {
      handle.current.queryClient.setQueryData(
        electionQueryKeys.election('p1'),
        process([question(1, 'ONGOING', 5), question(2)])
      )
    })
    // Wait for the new read to reach the SDK, then past the reset and the deferred restore.
    await waitFor(() => expect(handle.current.election.election.questions[0].results.voteCount).toBe(5))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(handle.current.fmethods.getValues()).toMatchObject({ '0': '1', '1': '0' })
    expect(handle.current.state.castError).toBe('boom')
    expect(screen.getByText('answers:{"0":"1","1":"0"}')).toBeInTheDocument()

    // A pause: a question status changes.
    act(() => {
      handle.current.queryClient.setQueryData(
        electionQueryKeys.election('p1'),
        process([question(1, 'PAUSED', 5), question(2, 'PAUSED')])
      )
    })
    await waitFor(() => expect(handle.current.election.election.questions[0].status).toBe('PAUSED'))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 50))
    })
    expect(handle.current.fmethods.getValues()).toMatchObject({ '0': '1', '1': '0' })
    expect(screen.getByText('answers:{"0":"1","1":"0"}')).toBeInTheDocument()
  })

  it('without the flow, the same poll empties the form (the defect audit F1 describes)', async () => {
    render(
      <AllProviders>
        <ElectionProvider id='p1' election={process()} queryOptions={{ staleTime: Infinity }}>
          <ComponentsProvider components={composeComponents(uiScaffoldComponents, voterComponents)}>
            <ConfirmProvider>
              <QuestionsFormProvider>
                <Bare />
              </QuestionsFormProvider>
            </ConfirmProvider>
          </ComponentsProvider>
        </ElectionProvider>
      </AllProviders>
    )
    act(() => handle.current.fmethods.setValue('0', '1'))
    expect(handle.current.fmethods.getValues()['0']).toBe('1')
    act(() => {
      handle.current.queryClient.setQueryData(
        electionQueryKeys.election('p1'),
        process([question(1, 'ONGOING', 9), question(2)])
      )
    })
    await waitFor(() => expect(handle.current.fmethods.getValues()['0']).toBe(''))
  })
})

describe('casting through the SDK vote() with the review screen as the confirmation (audit F3)', () => {
  it('signs every question in one batch with no dialog, and keeps the SDK sentence when it fails', async () => {
    signBatch = () => ({ signatures: [] })
    renderVoter()
    await identify()
    act(() => {
      handle.current.fmethods.setValue('0', '1')
      handle.current.fmethods.setValue('1', '0')
    })

    // Not awaited inside act: the confirmation resolves on a render, which an async act would hold back.
    let result: unknown = 'pending'
    act(() => {
      void handle.current.vote(formValuesFor(handle.current.state)).then((value: unknown) => {
        result = value
      })
    })
    await waitFor(() => expect(result).not.toBe('pending'), { timeout: 4000 })

    expect(result).toBe(false)
    const sign = calls.find((call) => call.path.endsWith('/sign-batch'))
    expect(sign?.body.ballots).toHaveLength(2)
    expect(screen.queryByRole('dialog')).toBeNull()
    // The SDK's own sentence (`errors.vote_failed`; the key itself here, the test i18n has no react-components strings).
    expect(String(handle.current.fmethods.formState.errors.root?.vote?.message)).toMatch(/vote_failed/)
  })

  it('relays the encoded ballots and resolves with the vote id when every question lands', async () => {
    signBatch = (body) => ({
      signatures: body.ballots.map((ballot: { upstreamId: string }) => ({
        upstreamId: ballot.upstreamId,
        signature: `0x${'1b'.repeat(65)}`,
        weight: '01',
      })),
    })
    renderVoter()
    await identify()
    act(() => {
      handle.current.fmethods.setValue('0', '1')
      handle.current.fmethods.setValue('1', '0')
    })

    // Not awaited inside act: the confirmation resolves on a render, which an async act would hold back.
    let result: unknown = 'pending'
    act(() => {
      void handle.current.vote(formValuesFor(handle.current.state)).then((value: unknown) => {
        result = value
      })
    })
    await waitFor(() => expect(result).not.toBe('pending'), { timeout: 4000 })

    expect(result).toBe('vote-1')
    expect(calls.filter((call) => call.path === '/votes')).toHaveLength(1)
    expect(calls.find((call) => call.path === '/votes')?.body.votes).toHaveLength(2)
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(handle.current.election.hasVoted).toBe(true))
    expect(handle.current.election.voteIds).toEqual({ q1: 'vote-1', q2: 'vote-2' })
  })
})

describe('the question screen shows the errors that stop a cast and hides the selection checks', () => {
  // The SDK form for real, with the voter's slots; `Form` keeps a handle on it to set the errors its vote would set.
  const Form = () => {
    handle.current = { fmethods: useQuestionsForm().fmethods }
    return null
  }
  const renderQuestion = (
    election = process(),
    flow = testFlow({ election, facts: testFacts({ questionCount: 2 }) })
  ) =>
    render(
      <AllProviders>
        <ElectionProvider id='p1' election={election} queryOptions={{ staleTime: Infinity }}>
          <ComponentsProvider components={composeComponents(uiScaffoldComponents, voterComponents)}>
            <ConfirmProvider>
              <QuestionsFormProvider>
                <VoterFlowContext.Provider value={flow}>
                  <Form />
                  <QuestionScreen index={0} paused={false} />
                </VoterFlowContext.Provider>
              </QuestionsFormProvider>
            </ConfirmProvider>
          </ComponentsProvider>
        </ElectionProvider>
      </AllProviders>
    )
  // The test i18n has no react-components strings, so the SDK's localiser answers with the key.
  const unsupportedNotice = 'errors.question_unsupported'

  it('offers Back on the first question too, to the welcome screen (a phone has no rail)', () => {
    const flow = testFlow({ election: process(), facts: testFacts({ questionCount: 2 }) })
    renderQuestion(process(), flow)
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    expect(flow.back).toHaveBeenCalledWith(0)
  })

  it('shows the SDK notice of a question whose ballot type is not supported, once', async () => {
    renderQuestion(process([{ ...question(1), type: undefined, ballotProtocol: undefined } as never, question(2)]))
    expect(await screen.findByRole('alert')).toHaveTextContent(unsupportedNotice)
    expect(screen.getAllByText(unsupportedNotice)).toHaveLength(1)
  })

  // Gate F10: the SDK would draw these as a single choice and pass one value through as an amounts array.
  it.each(['budget-based', 'quadratic'])(
    'replaces the ballot of a %s question with the unsupported notice',
    async (name) => {
      const budget = { ...question(1), type: '', ballotProtocol: undefined, metadata: { type: { name } } }
      renderQuestion(process([budget as never, question(2)]))
      expect(await screen.findByRole('alert')).toHaveTextContent(unsupportedNotice)
      expect(screen.queryAllByRole('radio')).toHaveLength(0)
      expect(screen.queryByText('Yes')).toBeNull()
    }
  )

  it.each(['unsupported', 'encode'])('shows a %s error the vote sets on the question', async (type) => {
    renderQuestion()
    act(() =>
      handle.current.fmethods.setError('0', { type, message: 'This question publishes a choice no voter can cast.' })
    )
    expect(await screen.findByRole('alert')).toHaveTextContent('This question publishes a choice no voter can cast.')
  })

  it.each(['required', 'validate'])('hides an ordinary %s selection error', async (type) => {
    renderQuestion()
    act(() => handle.current.fmethods.setError('0', { type, message: 'Select an option' }))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
    })
    expect(screen.queryByText('Select an option')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
