import userEvent from '@testing-library/user-event'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { electionQueryKeys } from '@vocdoni/react-components'
import { QueryClient } from '@tanstack/react-query'
import { voteNullifier } from '@vocdoni/api-voting'
import i18n from 'i18next'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { certAuthStorageKey } from '~components/Process/CertAuth/cert-auth'
import { buildAppEnv } from '~src/app-env-build'
import { AllProviders, createTestQueryClient } from '~src/test-utils'
import type { ProcessBrand } from '~utils/process-brand'
import type { VoterScreenKind } from './voter-flow'
import { VoterServerNow } from './VoterFlowProvider'
import { VoterPage } from './VoterPage'
import { showsLegalNotice } from './VoterView'

// The real SDK (providers, question form and fields): only the network is faked. The setup file stubs
// react-components' hooks for component tests; this suite needs the real ones.
vi.mock('@vocdoni/react-components', async (importOriginal) => importOriginal())

const NOW = Date.UTC(2026, 5, 15, 10, 0, 0)
const hex = (c: string) => c.repeat(64)
const brand: ProcessBrand = { branded: false, name: 'Ateneu' }

type Status = 'ONGOING' | 'PAUSED' | 'CANCELED' | 'ENDED' | 'RESULTS'
const single = (n: number, status: Status, voteCount = 0, secret = false) => ({
  id: `q${n}`,
  parentProcessId: 'p1',
  upstreamId: hex(String(n)),
  title: { default: `Question ${n}` },
  description: { default: '' },
  choices: [
    { title: { default: `Yes ${n}` }, value: 0 },
    { title: { default: `No ${n}` }, value: 1 },
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
  secretUntilTheEnd: secret,
  // A secret question is cast sealed to the keykeepers' keys; the provider refuses to cast it before they are published.
  encryptionKeys: secret ? [{ index: 0, key: hex('3') }] : undefined,
  status,
  metadata: {},
  results: { voteCount, maxVoters: 10, finalResults: status === 'RESULTS', results: [] },
})
const makeProcess = ({
  status = 'ONGOING' as Status,
  startDate = '2026-06-01T00:00:00.000Z',
  endDate = '2026-12-01T00:00:00.000Z',
  voteCount = 0,
  secret = false,
} = {}) =>
  ({
    id: 'p1',
    orgAddress: 'abc',
    chainId: 'vocdoni/TEST/1',
    title: { default: 'Assemblea' },
    description: { default: '' },
    header: '',
    published: true,
    startDate,
    endDate,
    census: { authFields: ['memberNumber'], twoFaFields: [], weighted: false, anonymous: false },
    questions: [single(1, status, voteCount, secret), single(2, status, voteCount, secret)],
  }) as unknown as VotingProcessResponse

// The fake backend: what GET /processes/p1 answers, and how the cast endpoints behave.
const QUESTION_OF: Record<string, string> = { [hex('1')]: 'q1', [hex('2')]: 'q2' }
const server = {
  process: makeProcess(),
  votes: 'ok' as 'ok' | 'reject',
  /** `partial`: the next relay lands question 1 and fails question 2, then relays behave as `done`. */
  jobs: 'done' as 'done' | 'hold' | 'partial',
  voted: false,
  /** Questions on chain one by one (a partial cast). */
  votedQuestions: new Set<string>(),
  /** Questions the CSP signed, with the nullifier sign-info reports for them. */
  signed: {} as Record<string, string>,
  /** What the membership check answers once the voter has identified: `empty` lists no question. */
  check: 'ok' as 'ok' | 'empty' | 'unauthorized',
  /** The connection drops right after the batch is relayed. */
  dropAfterRelay: false,
  offline: false,
}
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
let releaseJob: (() => void) | undefined

const fetchStub = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const request = input instanceof Request ? input : new Request(String(input), init)
  const { pathname } = new URL(request.url)
  if (request.method === 'GET' && pathname === '/processes/p1') return json(200, server.process)
  if (pathname === '/processes/p1/results') return json(404, { error: 'none' })
  if (pathname === '/processes/p1/auth/0') return json(200, { authToken: 'tok' })
  if (pathname === '/processes/p1/auth/1') return json(200, { authToken: 'tok' })
  if (server.offline) throw new TypeError('Failed to fetch')
  if (pathname === '/processes/p1/check') {
    if (server.check === 'unauthorized') return json(401, { error: 'session expired', code: 40100 })
    return json(200, {
      belongsToProcess: true,
      questions: (server.check === 'empty' ? [] : ['q1', 'q2']).map((id, i) => ({
        questionId: id,
        upstreamId: hex(String(i + 1)),
        canVote: true,
        hasVoted: server.voted || server.votedQuestions.has(id),
        hasSigned: server.voted || id in server.signed,
      })),
    })
  }
  if (pathname === '/processes/p1/sign-info') {
    const consumed = Object.entries(server.signed).map(([questionId, nullifier]) => ({ questionId, nullifier }))
    return json(200, { consumed })
  }
  if (pathname === '/processes/p1/sign-batch') {
    const body = JSON.parse(await request.text())
    for (const ballot of body.ballots as { upstreamId: string; address: string }[]) {
      try {
        server.signed[QUESTION_OF[ballot.upstreamId]] = voteNullifier(ballot.address, ballot.upstreamId)
      } catch (e) {}
    }
    return json(200, {
      signatures: body.ballots.map((ballot: { upstreamId: string }) => ({
        upstreamId: ballot.upstreamId,
        signature: `0x${'1b'.repeat(65)}`,
        weight: '01',
      })),
    })
  }
  if (pathname === '/votes') {
    if (server.votes === 'reject') return json(400, { error: 'queue full', code: 40000 })
    if (server.dropAfterRelay) server.offline = true
    return json(200, { jobId: 'job-1' })
  }
  if (pathname === '/jobs/job-1') {
    if (server.jobs === 'partial') {
      server.jobs = 'done'
      server.votedQuestions.add('q1')
      return json(200, {
        jobId: 'job-1',
        type: 'relay_votes',
        status: 'completed',
        result: {
          votes: [
            { status: 'completed', voteID: 'vote-1' },
            { status: 'failed', error: 'the chain refused it' },
          ],
        },
      })
    }
    if (server.jobs === 'hold') await new Promise<void>((resolve) => (releaseJob = resolve))
    server.voted = true
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
  }
  return json(404, { error: `no fake for ${pathname}` })
})

let queryClient: QueryClient
beforeEach(() => {
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
  })
  vi.setSystemTime(NOW)
  vi.stubGlobal('fetch', fetchStub)
  server.process = makeProcess()
  server.votes = 'ok'
  server.jobs = 'done'
  server.voted = false
  server.votedQuestions = new Set()
  server.signed = {}
  server.check = 'ok'
  server.dropAfterRelay = false
  server.offline = false
  queryClient = createTestQueryClient()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  releaseJob = undefined
})

const renderPage = (election = server.process, pageBrand = brand) =>
  render(
    <AllProviders queryClient={queryClient}>
      <VoterPage id='p1' election={election} brand={pageBrand} />
    </AllProviders>
  )

const onScreen = async (kind: string) =>
  waitFor(() => expect(screen.getByTestId('voter-screen')).toHaveAttribute('data-screen', kind), { timeout: 4000 })
const current = () => screen.getByTestId('voter-screen')
const pushServer = (process: VotingProcessResponse) => {
  server.process = process
  act(() => queryClient.setQueryData(electionQueryKeys.election('p1'), process))
}

const identify = async () => {
  await onScreen('identify')
  fireEvent.change(within(current()).getByRole('textbox'), { target: { value: '42' } })
  fireEvent.click(within(current()).getByRole('checkbox', { hidden: true }))
  fireEvent.click(within(current()).getByRole('button', { name: 'voter.continue' }))
  await onScreen('welcome')
}
const choose = (question: number, value: number) => {
  const input = within(current()).getByDisplayValue(String(value)) as HTMLInputElement
  fireEvent.click(input)
  expect(input).toBeChecked()
  void question
}
const answerBoth = async () => {
  fireEvent.click(within(current()).getByRole('button', { name: 'voter.welcome.start' }))
  await onScreen('question')
  choose(0, 1)
  fireEvent.click(screen.getByTestId('voter-continue'))
  await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 2'))
  choose(1, 0)
  fireEvent.click(screen.getByTestId('voter-continue'))
  await onScreen('review')
  // "Emet el vot" arms a moment after review appears (gate F1).
  await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeEnabled())
}
const signBatchCalls = () =>
  fetchStub.mock.calls.filter(([input]) =>
    (input instanceof Request ? input.url : String(input)).includes('sign-batch')
  )

/** The process with a tally on both questions: 6 and 3 of 9 voters unless told otherwise. */
const tallied = (process: VotingProcessResponse, { results = [['6', '3']], final = false, secret = false } = {}) =>
  ({
    ...process,
    questions: process.questions.map((question) => ({
      ...question,
      secretUntilTheEnd: secret,
      results: { ...question.results, voteCount: 9, results, finalResults: final },
    })),
  }) as VotingProcessResponse
const heading = () => screen.getByRole('heading', { level: 1 })
const firstBar = () => screen.getAllByRole('progressbar')[0]
const EARLIER = new Date(NOW - 60_000).toISOString()
const LATER = '2026-12-01T00:00:00.000Z'

describe('voter page transitions (AC4)', () => {
  it('the start instant passes: upcoming, then identify, with no reload', async () => {
    server.process = makeProcess({ startDate: new Date(NOW + 60_000).toISOString() })
    renderPage()
    await onScreen('upcoming')
    await act(() => vi.advanceTimersByTimeAsync(61_000))
    await onScreen('identify')
  })

  it('the end instant passes mid-ballot: closed, and the results are reachable, with no reload', async () => {
    server.process = makeProcess({ endDate: new Date(NOW + 120_000).toISOString() })
    renderPage()
    await identify()
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.welcome.start' }))
    await onScreen('question')
    await act(() => vi.advanceTimersByTimeAsync(121_000))
    await onScreen('closed')
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.results.show' }))
    await onScreen('results')
  })

  it('a pause and a resume keep the answers', async () => {
    renderPage()
    await identify()
    await answerBoth()
    pushServer(makeProcess({ status: 'PAUSED' }))
    await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeDisabled())
    expect(within(current()).getByText('Yes 2')).toBeInTheDocument()
    pushServer(makeProcess({ status: 'ONGOING' }))
    await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeEnabled())
    expect(within(current()).getByText('No 1')).toBeInTheDocument()
    expect(within(current()).getByText('Yes 2')).toBeInTheDocument()
  })

  it('a cancel moves the welcome screen, once identified, to canceled', async () => {
    renderPage()
    await identify()
    pushServer(makeProcess({ status: 'CANCELED' }))
    await onScreen('canceled')
  })

  it('a confirmed vote goes from sending to the receipt', async () => {
    server.jobs = 'hold'
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('sending')
    await waitFor(() => expect(releaseJob).toBeDefined())
    act(() => releaseJob?.())
    await onScreen('receipt')
    expect(screen.getByTestId('vote-receipt')).toHaveTextContent('vote-1')
  })

  // Gate F1: on a phone "Emet el vot" appears under the finger that tapped "Continua", inside the same tap.
  it('the second tap of a double tap on the last "Continua" does not cast; a tap once it is armed does', async () => {
    renderPage()
    await identify()
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.welcome.start' }))
    await onScreen('question')
    choose(0, 1)
    fireEvent.click(screen.getByTestId('voter-continue'))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 2'))
    choose(1, 0)
    fetchStub.mockClear()
    fireEvent.click(screen.getByTestId('voter-continue'))
    expect(current()).toHaveAttribute('data-screen', 'review')
    await act(() => vi.advanceTimersByTimeAsync(100))
    fireEvent.click(screen.getByTestId('voter-cast'))
    await act(() => vi.advanceTimersByTimeAsync(100))
    expect(current()).toHaveAttribute('data-screen', 'review')
    expect(signBatchCalls()).toHaveLength(0)
    await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeEnabled())
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('receipt')
    expect(signBatchCalls()).toHaveLength(1)
  })

  it('a relay failure goes back to review with the SDK sentence; the signed ballots wait to be re-sent', async () => {
    server.votes = 'reject'
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('review')
    await waitFor(() => expect(within(current()).getByRole('alert')).toHaveTextContent('errors.vote_failed'))
    // The SDK's sentence for this failure, not the generic fallback that also contains `errors.vote_failed` (gate F11).
    expect(within(current()).getByRole('alert')).not.toHaveTextContent('errors.vote_failed_unknown')
    // The CSP signed both questions: their answers can no longer change, and "Torna-ho a provar" re-sends them.
    expect(within(current()).getAllByText('vote.pending_resend')).toHaveLength(2)
    expect(screen.getByTestId('voter-cast')).toHaveTextContent('voter.review.retry')
    server.votes = 'ok'
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('receipt')
  })

  // Gate F2: question 1 lands, question 2 fails. Question 1 is on chain: no route may change its answer, review shows
  // what was sent for it, and the retry re-sends question 2 only.
  it('after a partial cast the question on chain is locked everywhere and only the failed one is re-sent', async () => {
    server.jobs = 'partial'
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('review')
    await waitFor(() => expect(within(current()).getByRole('alert')).toHaveTextContent('errors.vote_partial'))
    // Review: the answer that was sent for question 1, with no "Canvia"; question 2 waits to be re-sent.
    expect(within(current()).getByText('No 1')).toBeInTheDocument()
    expect(within(current()).getByText('vote.pending_resend')).toBeInTheDocument()
    expect(within(current()).queryAllByRole('button', { name: 'voter.review.change_label' })).toHaveLength(0)
    // The rail does not offer question 1.
    const rail = document.querySelector('[data-scope="voter-shell"][data-part="rail"]') as HTMLElement
    expect(within(rail).queryByRole('button', { name: /Question 1/ })).toBeNull()
    // The browser's Back to question 1 shows the notice, with no field to change.
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { voterStep: { name: 'question', index: 0 } } }))
    })
    await onScreen('question')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 1')
    expect(within(current()).getByText('vote.disabled.voted')).toBeInTheDocument()
    expect(within(current()).queryAllByRole('radio')).toHaveLength(0)
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { voterStep: { name: 'review' } } }))
    })
    await onScreen('review')
    await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeEnabled())
    fetchStub.mockClear()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('receipt')
    // Re-sent from the stored transaction: nothing is signed again, question 1 least of all.
    expect(signBatchCalls()).toHaveLength(0)
  })

  // Gate F6: the review that would show the error is gone once the vote closes.
  it('a cast that fails as the vote closes says on the closed screen that the vote was not recorded', async () => {
    server.process = makeProcess({ endDate: new Date(NOW + 5_000).toISOString() })
    server.votes = 'reject'
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await act(() => vi.advanceTimersByTimeAsync(6_000))
    await onScreen('closed')
    expect(within(current()).getByRole('alert')).toHaveTextContent('voter.closed.not_cast')
  })

  // Gate-2 N2 (a): question 1 lands, question 2 is refused, the voter does not retry, the vote closes.
  it('a partial cast as the vote closes says how many answers were recorded, with their code', async () => {
    server.process = makeProcess({ endDate: new Date(NOW + 5_000).toISOString() })
    server.jobs = 'partial'
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await act(() => vi.advanceTimersByTimeAsync(6_000))
    await onScreen('closed')
    const alert = within(current()).getByRole('alert')
    expect(alert).toHaveTextContent('voter.closed.partly_cast')
    expect(alert).not.toHaveTextContent('voter.closed.not_cast')
    expect(within(current()).getByText('voter.receipt.card_title')).toBeInTheDocument()
  })

  // Gate-2 N2 (b): the relay's answer is lost and the chain cannot be read for the SDK's two minutes, then the vote
  // closes. The vote may have landed: the screen says so, and "Comprova el teu vot" reads the chain again.
  it('a cast whose landing could not be checked as the vote closes says it may be recorded, then checks', async () => {
    server.process = makeProcess({ endDate: new Date(NOW + 300_000).toISOString() })
    server.dropAfterRelay = true
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('sending')
    // The SDK gives up on learning the outcome after about three minutes (since the api-client 2.8 and react 4.1 bump).
    // The clock moves in 5 s steps, as it does for a real tab: one 185 s jump fires the process polls and the SDK's
    // checks out of order and ends on its generic failure instead.
    for (let elapsed = 0; elapsed < 185_000; elapsed += 5_000) await act(() => vi.advanceTimersByTimeAsync(5_000))
    await onScreen('review')
    expect(within(current()).getByRole('alert')).toHaveTextContent('errors.vote_unconfirmed')
    await act(() => vi.advanceTimersByTimeAsync(120_000))
    await onScreen('closed')
    expect(within(current()).getByRole('alert')).toHaveTextContent('voter.closed.unconfirmed')
    // It had landed.
    server.offline = false
    server.voted = true
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.results.check_vote' }))
    await onScreen('alreadyVoted')
  })

  it('a secret open vote: the receipt offers the results, and they open as "hidden" with the date', async () => {
    server.process = makeProcess({ secret: true })
    server.jobs = 'hold'
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('sending')
    await waitFor(() => expect(releaseJob).toBeDefined())
    act(() => releaseJob?.())
    await onScreen('receipt')
    expect(within(current()).queryByText(/voter\.receipt\.results_later/)).toBeNull()
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.results.show' }))
    await onScreen('results')
    expect(within(current()).getByText('voter.results.hidden_help')).toBeInTheDocument()
    expect(within(current()).queryAllByRole('progressbar')).toHaveLength(0)
  })

  it('offline then online while sending: the screen stays, then settles on the receipt', async () => {
    server.dropAfterRelay = true
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('sending')
    // The SDK keeps checking the chain every 2.5 s while the outcome is unknown.
    await act(() => vi.advanceTimersByTimeAsync(10_000))
    expect(current()).toHaveAttribute('data-screen', 'sending')
    server.offline = false
    server.voted = true
    await act(() => vi.advanceTimersByTimeAsync(5_000))
    await onScreen('receipt')
  })

  // The guard of audit F1 (preflight F1): the SDK form resets every field when the process read changes identity.
  // The waits let react-query deliver the new read and the reset (and the flow's restore after it) run before the
  // check, so the selection on screen is asserted after the reset, not before it.
  it('a poll that changes the results keeps the answers on screen and in review (audit F1)', async () => {
    renderPage()
    await identify()
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.welcome.start' }))
    await onScreen('question')
    choose(0, 1)
    pushServer(makeProcess({ voteCount: 7 }))
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(within(current()).getByDisplayValue('1')).toBeChecked()
    fireEvent.click(screen.getByTestId('voter-continue'))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 2'))
    choose(1, 0)
    pushServer(makeProcess({ voteCount: 8 }))
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(within(current()).getByDisplayValue('0')).toBeChecked()
    fireEvent.click(screen.getByTestId('voter-continue'))
    await onScreen('review')
    expect(within(current()).getByText('No 1')).toBeInTheDocument()
    expect(within(current()).getByText('Yes 2')).toBeInTheDocument()
  })

  it('reaching review through history with question 2 unanswered lands on question 2 (audit F4)', async () => {
    renderPage()
    await identify()
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.welcome.start' }))
    await onScreen('question')
    choose(0, 1)
    fireEvent.click(screen.getByTestId('voter-continue'))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 2'))
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { voterStep: { name: 'review' } } }))
    })
    await onScreen('question')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 2')
    // The new screen's heading takes the focus.
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveFocus())
    // The answers stay out of session replays: the column and the agenda (preflight F17).
    expect(current()).toHaveClass('ph-no-capture')
    expect(document.querySelector('[data-scope="voter-shell"][data-part="rail"] .ph-no-capture')).not.toBeNull()
  })

  it('server-renders the identify screen in the brand of the vote, with the button off until hydration', () => {
    const logo = 'https://cdn.example/acme.svg'
    const html = renderToString(
      <AllProviders queryClient={queryClient}>
        <VoterPage id='p1' election={server.process} brand={{ branded: true, name: 'Acme', logo }} />
      </AllProviders>
    )
    expect(html).toContain('data-screen="identify"')
    expect(html).toContain(logo)
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/)
  })
})

// A certificate census: the gateway sends the voter back to the voting page with its answer in the fragment.
const CERT_STATE = 's'.repeat(22)
const CERT_VERIFIER = 'v'.repeat(43)
const CERT_CODE = 'c'.repeat(43)
const certProcess = (twoFaFields: string[] = []) =>
  ({
    ...makeProcess(),
    census: { authFields: ['nationalId'], twoFaFields, weighted: false, anonymous: false, certAuth: true },
  }) as unknown as VotingProcessResponse
/** Lands on the voting page as the gateway sends the voter back, with the flow this tab started. */
const landOnCertReturn = (
  fragment: string,
  stored: object | null = { state: CERT_STATE, codeVerifier: CERT_VERIFIER }
) => {
  if (stored)
    sessionStorage.setItem(certAuthStorageKey('p1'), JSON.stringify({ ...stored, startedAt: NOW, loadId: 'this' }))
  window.history.replaceState(null, '', `/en/processes/p1#${fragment}`)
}
/** The JSON bodies sent to the endpoint whose path ends with `suffix`, in order. */
const bodiesTo = async (suffix: string) => {
  const bodies: Record<string, unknown>[] = []
  for (const [input, init] of fetchStub.mock.calls) {
    const request = input instanceof Request ? input : new Request(String(input), init)
    if (new URL(request.url).pathname.endsWith(suffix)) bodies.push(JSON.parse(await request.clone().text()))
  }
  return bodies
}

describe('voter page certificate sign-in', () => {
  const renderCertPage = () =>
    render(
      <AllProviders queryClient={queryClient} appEnv={{ CERT_GATEWAY_URL: 'https://cert.test:15140' }}>
        <VoterPage id='p1' election={server.process} brand={brand} />
      </AllProviders>
    )

  it('redeems the gateway code at step 0 of an auth-only census, then reaches the welcome screen', async () => {
    server.process = certProcess()
    landOnCertReturn(`certCode=${CERT_CODE}&state=${CERT_STATE}`)
    renderCertPage()

    await onScreen('welcome')
    expect(await bodiesTo('/processes/p1/auth/0')).toEqual([
      expect.objectContaining({ certCode: CERT_CODE, codeVerifier: CERT_VERIFIER }),
    ])
    expect(window.location.hash).toBe('')
    expect(sessionStorage.getItem(certAuthStorageKey('p1'))).toBeNull()
  })

  it('with 2FA: the contact goes with the code, then the code step confirms the voter', async () => {
    server.process = certProcess(['email'])
    landOnCertReturn(`certCode=${CERT_CODE}&state=${CERT_STATE}`)
    renderCertPage()

    await onScreen('identify')
    fireEvent.change(within(current()).getByRole('textbox', { name: /Email/ }), {
      target: { value: 'voter@example.com' },
    })
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.continue' }))
    await onScreen('code')
    expect(await bodiesTo('/processes/p1/auth/0')).toEqual([
      expect.objectContaining({ certCode: CERT_CODE, codeVerifier: CERT_VERIFIER, email: 'voter@example.com' }),
    ])

    // Zag finds its boxes with an escaped id that jsdom's selector engine misses (see CertAuth's tests)
    const escape = vi.spyOn(CSS, 'escape').mockImplementation((value) => `"${value}"`)
    // typed digit by digit, as a voter does: the boxes take them and the code submits itself
    const user = userEvent.setup({ advanceTimers: (ms) => vi.advanceTimersByTimeAsync(ms) })
    await user.click(current().querySelector<HTMLInputElement>('input[data-part="input"]')!)
    await user.keyboard('123456')
    await onScreen('welcome')
    expect(await bodiesTo('/processes/p1/auth/1')).toHaveLength(1)
    escape.mockRestore()
  })

  it('a return with no flow stored offers the sign-in again and calls nothing', async () => {
    server.process = certProcess()
    landOnCertReturn(`certCode=${CERT_CODE}&state=${CERT_STATE}`, null)
    renderCertPage()

    await onScreen('identify')
    expect(within(current()).getByRole('button', { name: 'csp.cert.start' })).toBeInTheDocument()
    expect(await bodiesTo('/processes/p1/auth/0')).toEqual([])
  })

  it('server-renders the certificate identify screen with the start off until hydration', () => {
    server.process = certProcess()
    const html = renderToString(
      <AllProviders queryClient={queryClient} appEnv={{ CERT_GATEWAY_URL: 'https://cert.test:15140' }}>
        <VoterPage id='p1' election={server.process} brand={brand} />
      </AllProviders>
    )
    expect(html).toContain('data-screen="identify"')
    expect(html).not.toContain('nationalId')
    expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled/)
  })
})

describe('voter page membership check', () => {
  // Gate F9: a member the check lists no question for has nothing to vote, and is never told the session expired.
  it('a check that lists no question lands on notEligible and stays there', async () => {
    server.check = 'empty'
    renderPage()
    await onScreen('identify')
    fireEvent.change(within(current()).getByRole('textbox'), { target: { value: '42' } })
    fireEvent.click(within(current()).getByRole('checkbox', { hidden: true }))
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.continue' }))
    await onScreen('notEligible')
    await act(() => vi.advanceTimersByTimeAsync(25_000))
    expect(current()).toHaveAttribute('data-screen', 'notEligible')
  })

  // Gate F11: the page, not only the reducer, signs out on a 401 from the check.
  it('a 401 from the check after identification goes back to identify with the session note', async () => {
    renderPage()
    await identify()
    server.check = 'unauthorized'
    act(() => void queryClient.invalidateQueries({ queryKey: ['voter-check'] }))
    await onScreen('identify')
    expect(within(current()).getByText('voter.identify.session_expired')).toBeInTheDocument()
  })
})

describe('voter page shell', () => {
  it('shows the organisation logo and name in the top bar, and the logo is not a link (ruling R18)', async () => {
    const logo = 'https://cdn.example/acme.svg'
    renderPage(server.process, { branded: true, name: 'Acme', logo })
    await onScreen('identify')
    const header = document.querySelector('header') as HTMLElement
    expect(header.querySelector('img')).toHaveAttribute('src', logo)
    expect(header.querySelector('a')).toBeNull()
    expect(header).toHaveTextContent('Acme')
  })

  it('keeps the Vocdoni symbol beside the name when the vote shows no logo', async () => {
    renderPage()
    await onScreen('identify')
    const header = document.querySelector('header') as HTMLElement
    expect(header.querySelector('img')).toBeNull()
    expect(header.querySelector('svg')).not.toBeNull()
    expect(header.querySelector('a')).toBeNull()
    expect(header).toHaveTextContent('Ateneu')
  })

  it('puts the terms and privacy links in the credit line, at the foot and in the bar (ruling R18)', async () => {
    i18n.addResource(
      'en',
      'common',
      'footer.terms_and_privacy',
      '<link1>Terms of use</link1> & <link2>Privacy Policy</link2>'
    )
    const env = buildAppEnv({})
    renderPage()
    await onScreen('identify')
    const foot = document.querySelector('footer') as HTMLElement
    const bar = screen.getByRole('region', { name: 'voter.actions_label' })
    expect(foot).toHaveTextContent('voter.credit.text')
    for (const place of [foot, bar]) {
      const credit = within(place).getByText('voter.credit.text').parentElement as HTMLElement
      const terms = within(credit).getByRole('link', { name: 'Terms of use' })
      const privacy = within(credit).getByRole('link', { name: 'Privacy Policy' })
      expect(terms).toHaveAttribute('href', env.TERMS_OF_SERVICE_URL)
      expect(privacy).toHaveAttribute('href', env.PRIVACY_POLICY_URL)
      // A new tab, so reading them never ends the voter's session.
      for (const link of [terms, privacy]) {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link.getAttribute('rel')).toContain('noopener')
      }
    }
    // Nothing of the footer is left at the end of the column.
    expect(within(screen.getByRole('main')).getAllByRole('link', { name: 'Terms of use' })).toHaveLength(1)
    expect(within(bar).getByRole('link', { name: 'Terms of use' })).toBeInTheDocument()
  })

  it('shows the legal notice on identification, in a new tab for its link, and not on a question', async () => {
    renderPage()
    await onScreen('identify')
    const notice = screen.getByTestId('layout-legal-notice')
    expect(screen.getByRole('main')).toContainElement(notice)
    expect(within(notice).getByRole('link', { name: 'vocdoni.io' })).toHaveAttribute('target', '_blank')
    await identify()
    expect(screen.getByTestId('layout-legal-notice')).toBeInTheDocument()
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.welcome.start' }))
    await onScreen('question')
    expect(screen.queryByTestId('layout-legal-notice')).toBeNull()
  })
})

describe('voter legal notice placement', () => {
  it.each<[VoterScreenKind, boolean]>([
    ['identify', true],
    ['welcome', true],
    ['alreadyVoted', true],
    ['upcoming', true],
    ['closed', true],
    ['paused', true],
    ['canceled', true],
    ['notEligible', true],
    ['unavailable', true],
    ['roomNotStarted', true],
    ['roomOpen', true],
    ['roomSkipped', true],
    ['roomMissed', true],
    ['roomClosedVoted', true],
    ['roomNotEligible', true],
    ['roomNone', true],
    ['roomQuestion', false],
    ['roomVoted', false],
    ['results', true],
    ['question', false],
    ['review', false],
    ['sending', false],
    ['receipt', false],
    ['code', false],
    ['checking', false],
  ])('%s: %s', (kind, shown) => {
    expect(showsLegalNotice(kind)).toBe(shown)
  })
})

describe('voter page with a device clock that runs ahead (gate F4)', () => {
  it("keeps the vote open until the server says it ended, not the device's clock", async () => {
    // The device is ten minutes ahead of the server, the vote ends in five by the server's clock.
    server.process = makeProcess({ endDate: new Date(NOW + 5 * 60_000).toISOString() })
    vi.setSystemTime(NOW + 10 * 60_000)
    render(
      <AllProviders queryClient={queryClient}>
        <VoterServerNow.Provider value={NOW}>
          <VoterPage id='p1' election={server.process} brand={brand} />
        </VoterServerNow.Provider>
      </AllProviders>
    )
    await onScreen('identify')
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(current()).toHaveAttribute('data-screen', 'identify')
    pushServer(makeProcess({ status: 'ENDED', endDate: new Date(NOW + 5 * 60_000).toISOString() }))
    await onScreen('closed')
  })
})

describe('voter page clock at hydration (conformance D-24)', () => {
  it("draws the server's screen at the server's instant, then follows the browser's clock", async () => {
    // The vote opens a minute after the server read it; the browser's clock is already past the start.
    server.process = makeProcess({ startDate: new Date(NOW + 60_000).toISOString() })
    const page = (
      <AllProviders queryClient={queryClient}>
        <VoterServerNow.Provider value={NOW}>
          <VoterPage id='p1' election={server.process} brand={brand} />
        </VoterServerNow.Provider>
      </AllProviders>
    )
    const html = renderToString(page)
    expect(html).toContain('data-screen="upcoming"')

    vi.setSystemTime(NOW + 120_000)
    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)
    const failures: unknown[] = []
    let root: ReturnType<typeof hydrateRoot> | undefined
    await act(async () => {
      root = hydrateRoot(container, page, { onRecoverableError: (error) => failures.push(error) })
    })
    expect(failures).toEqual([])
    await waitFor(() =>
      expect(container.querySelector('[data-testid="voter-screen"]')).toHaveAttribute('data-screen', 'identify')
    )
    act(() => root?.unmount())
    container.remove()
  })
})

describe('voter results follow the vote with no reload (SP5)', () => {
  it('provisional figures change with a poll, then count and turn final when the vote ends', async () => {
    const endDate = new Date(NOW + 120_000).toISOString()
    server.process = tallied(makeProcess({ endDate }))
    renderPage()
    await onScreen('identify')
    fireEvent.click(screen.getByTestId('voter-show-results'))
    await onScreen('results')
    expect(heading()).toHaveTextContent('voter.results.provisional_title')
    expect(firstBar()).toHaveAttribute('aria-valuenow', '67')
    const focusedOnOpen = document.activeElement
    pushServer(tallied(makeProcess({ endDate }), { results: [['7', '2']] }))
    await waitFor(() => expect(firstBar()).toHaveAttribute('aria-valuenow', '78'))
    expect(document.querySelector('[data-leading]')).toBeNull()
    // The end instant passes: over by the clock, before the chain marks the tally final.
    await act(() => vi.advanceTimersByTimeAsync(121_000))
    await waitFor(() => expect(heading()).toHaveTextContent('voter.results.counting_title'))
    // A live change never moves the focus (it stays where opening the results put it).
    expect(document.activeElement).toBe(focusedOnOpen)
    expect(document.querySelector('[data-leading]')).toBeNull()
    pushServer(tallied(makeProcess({ status: 'RESULTS', endDate }), { results: [['7', '2']], final: true }))
    await waitFor(() => expect(heading()).toHaveTextContent('voter.results.final_title'))
    expect(current()).toHaveAttribute('data-screen', 'results')
    expect(document.querySelector('[data-leading]')).not.toBeNull()
  })

  it('a secret vote shows no figure until the chain publishes its tally, hidden again if it is extended', async () => {
    // Over by the clock; its secret tally is not published yet.
    server.process = tallied(makeProcess({ endDate: EARLIER }), { secret: true, results: [] })
    renderPage()
    await onScreen('closed')
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.results.show' }))
    await onScreen('results')
    expect(heading()).toHaveTextContent('voter.results.counting_title')
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
    // The organiser extends the vote: secret until it closes again.
    pushServer(tallied(makeProcess({ endDate: LATER }), { secret: true, results: [] }))
    await waitFor(() => expect(heading()).toHaveTextContent('Assemblea'))
    expect(within(current()).getByText('voter.results.hidden_help')).toBeInTheDocument()
    expect(screen.queryAllByRole('progressbar')).toHaveLength(0)
    // It closes and the chain publishes the tally.
    pushServer(tallied(makeProcess({ status: 'RESULTS', endDate: EARLIER }), { secret: true, final: true }))
    await waitFor(() => expect(heading()).toHaveTextContent('voter.results.final_title'))
    expect(screen.getAllByRole('progressbar')).toHaveLength(4)
    expect(document.querySelector('[data-leading]')).not.toBeNull()
  })

  it('the receipt offers the results and "Enrere" comes back to it', async () => {
    renderPage()
    await identify()
    await answerBoth()
    fireEvent.click(screen.getByTestId('voter-cast'))
    await onScreen('receipt')
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.results.show' }))
    await onScreen('results')
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.back' }))
    await onScreen('receipt')
  })
})
