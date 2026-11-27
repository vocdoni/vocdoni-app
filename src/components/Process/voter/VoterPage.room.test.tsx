import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { electionQueryKeys } from '@vocdoni/react-components'
import * as providers from '@vocdoni/react-providers'
import { QueryClient } from '@tanstack/react-query'
import { AllProviders, createTestQueryClient } from '~src/test-utils'
import type { ProcessBrand } from '~utils/process-brand'
import { VoterPage } from './VoterPage'

// The real SDK (providers, question form and fields): only the network is faked. The setup file stubs
// react-components' hooks for component tests; this suite needs the real ones.
vi.mock('@vocdoni/react-components', async (importOriginal) => importOriginal())

const NOW = Date.UTC(2026, 5, 15, 10, 0, 0)
const hex = (c: string) => c.repeat(64)
const brand: ProcessBrand = { branded: false, name: 'Ateneu' }

// SDK #118 signs the open questions only; 4.1.0 batches every unvoted one and the CSP refuses the batch. The casts
// below need #118: they skip themselves on 4.1.0 (the published lockfile) and run with the local override (plan
// Merge 0). Remove the guard with the bump.
const SDK_CASTS_OPEN_ONLY = 'NoOpenQuestionError' in providers
const describeCasts = SDK_CASTS_OPEN_ONLY ? describe : describe.skip

type Status = 'ONGOING' | 'PAUSED' | 'ENDED' | 'RESULTS' | 'CANCELED'
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
// A question-by-question vote (created PAUSED); three questions in these statuses.
const qbqProcess = (statuses: Status[], voteCounts: number[] = statuses.map(() => 0)) =>
  ({
    id: 'p1',
    orgAddress: 'abc',
    chainId: 'vocdoni/TEST/1',
    initialStatus: 'PAUSED',
    title: { default: 'Assemblea' },
    description: { default: '' },
    header: '',
    published: true,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-12-01T00:00:00.000Z',
    census: { authFields: ['memberNumber'], twoFaFields: [], weighted: false, anonymous: false },
    questions: statuses.map((status, index) => ({
      ...single(index + 1, status, voteCounts[index]),
      endedAt:
        status === 'RESULTS' || status === 'ENDED' ? new Date(NOW - (10 - index) * 60_000).toISOString() : undefined,
    })),
  }) as unknown as VotingProcessResponse

const QUESTION_OF: Record<string, string> = { [hex('1')]: 'q1', [hex('2')]: 'q2', [hex('3')]: 'q3' }
const server = {
  process: qbqProcess(['PAUSED', 'PAUSED', 'PAUSED']),
  voted: new Set<string>(),
  batches: [] as string[][],
  /** Which batch of the test (1 is the first) the CSP fails with a 503; 0 for none. */
  failBatch: 0,
}
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
let lastBatch: string[] = []

const fetchStub = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const request = input instanceof Request ? input : new Request(String(input), init)
  const { pathname } = new URL(request.url)
  if (request.method === 'GET' && pathname === '/processes/p1') return json(200, server.process)
  if (pathname === '/processes/p1/results') return json(404, { error: 'none' })
  if (pathname === '/processes/p1/auth/0') return json(200, { authToken: 'tok' })
  if (pathname === '/processes/p1/check') {
    return json(200, {
      belongsToProcess: true,
      questions: ['q1', 'q2', 'q3'].map((id, i) => ({
        questionId: id,
        upstreamId: hex(String(i + 1)),
        canVote: true,
        hasVoted: server.voted.has(id),
        hasSigned: server.voted.has(id),
      })),
    })
  }
  if (pathname === '/processes/p1/sign-info') return json(200, { consumed: [] })
  if (pathname === '/processes/p1/sign-batch') {
    const body = JSON.parse(await request.text())
    const ballots = body.ballots as { upstreamId: string }[]
    const ids = ballots.map((b) => QUESTION_OF[b.upstreamId])
    server.batches.push(ids)
    const closed = ids.findIndex((id) => server.process.questions.find((q) => q.id === id)?.status !== 'ONGOING')
    // The nth batch of the test fails for another reason than a closed question.
    if (server.batches.length === server.failBatch) return json(503, { error: 'unavailable', code: 50300 })
    if (closed >= 0) {
      return json(401, { error: `question is not open for voting: at index ${closed}`, code: 40001 })
    }
    lastBatch = ids
    return json(200, {
      signatures: ballots.map((ballot) => ({
        upstreamId: ballot.upstreamId,
        signature: `0x${'1b'.repeat(65)}`,
        weight: '01',
      })),
    })
  }
  if (pathname === '/votes') return json(200, { jobId: 'job-1' })
  if (pathname === '/jobs/job-1') {
    lastBatch.forEach((id) => server.voted.add(id))
    return json(200, {
      jobId: 'job-1',
      type: 'relay_votes',
      status: 'completed',
      result: { votes: lastBatch.map((id) => ({ status: 'completed', voteID: `vote-${id}` })) },
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
  server.process = qbqProcess(['PAUSED', 'PAUSED', 'PAUSED'])
  server.voted = new Set()
  server.batches = []
  server.failBatch = 0
  lastBatch = []
  queryClient = createTestQueryClient()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
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

const identify = async (landing: string) => {
  await onScreen('identify')
  fireEvent.change(within(current()).getByRole('textbox'), { target: { value: '42' } })
  fireEvent.click(within(current()).getByRole('checkbox', { hidden: true }))
  fireEvent.click(within(current()).getByRole('button', { name: 'voter.continue' }))
  await onScreen(landing)
}

describe('question by question on the real SDK (boards V4VoterWideLive)', () => {
  it('identifies first, waits on frame 0, and a question that opens takes the voter to it with no reload', async () => {
    renderPage(server.process)
    await identify('roomNotStarted')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('voter.room.not_started_title')
    pushServer(qbqProcess(['ONGOING', 'PAUSED', 'PAUSED']))
    await onScreen('roomQuestion')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 1')
    // The new title takes the focus (auto-navigation).
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 1 }))
  })

  it('skips and returns, leaves for the room and returns, and a close without a vote reads 3c', async () => {
    server.process = qbqProcess(['ONGOING', 'PAUSED', 'PAUSED'])
    renderPage(server.process)
    await identify('roomQuestion')
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.room.skip' }))
    await onScreen('roomSkipped')
    fireEvent.click(within(current()).getByRole('button', { name: 'voter.room.vote_question' }))
    await onScreen('roomQuestion')
    fireEvent.click(screen.getByRole('button', { name: 'voter.back' }))
    await onScreen('roomOpen')
    fireEvent.click(screen.getByRole('button', { name: 'voter.room.vote_now' }))
    await onScreen('roomQuestion')
    pushServer(qbqProcess(['RESULTS', 'PAUSED', 'PAUSED'], [4, 0, 0]))
    await onScreen('roomMissed')
    expect(server.batches).toEqual([])
  })

  it('keeps the chosen answer across a poll and a pause, with the button off while paused', async () => {
    server.process = qbqProcess(['ONGOING', 'PAUSED', 'PAUSED'])
    renderPage(server.process)
    await identify('roomQuestion')
    fireEvent.click(within(current()).getByDisplayValue('1'))
    pushServer(qbqProcess(['PAUSED', 'PAUSED', 'PAUSED'], [3, 0, 0]))
    await waitFor(() => expect(within(current()).getByRole('status')).toHaveTextContent('voter.paused.notice_title'))
    expect(screen.getByTestId('voter-cast')).toHaveAttribute('aria-disabled', 'true')
    pushServer(qbqProcess(['ONGOING', 'PAUSED', 'PAUSED'], [3, 0, 0]))
    await waitFor(() => expect(within(current()).getByDisplayValue('1')).toBeChecked())
  })

  it('shows no results while the vote runs (R11)', async () => {
    server.process = qbqProcess(['RESULTS', 'ONGOING', 'PAUSED'], [4, 1, 0])
    renderPage(server.process)
    await onScreen('identify')
    fireEvent.click(screen.getByTestId('voter-show-results'))
    await onScreen('results')
    expect(screen.getByText(/voter\.results\.hidden_help/)).toBeInTheDocument()
  })

  it('a returning voter whose open question is on chain sees frame 3 without the answer', async () => {
    server.process = qbqProcess(['ONGOING', 'PAUSED', 'PAUSED'])
    server.voted.add('q1')
    renderPage(server.process)
    await identify('roomVoted')
    expect(screen.queryByText('voter.room.voted_help')).toBeNull()
  })

  describeCasts('casting (needs SDK #118)', () => {
    it('casts the open question alone, shows frame 3, then 4 when it closes, then the next one', async () => {
      server.process = qbqProcess(['RESULTS', 'ONGOING', 'PAUSED'], [4, 0, 0])
      renderPage(server.process)
      await identify('roomQuestion')
      fireEvent.click(within(current()).getByDisplayValue('0'))
      await waitFor(() => expect(screen.getByTestId('voter-cast')).not.toHaveAttribute('aria-disabled'))
      fireEvent.click(screen.getByTestId('voter-cast'))
      await onScreen('roomVoted')
      expect(server.batches).toEqual([['q2']])
      // No room frame names the answer (gate-3 F1, owner ruling 2026-11-24).
      expect(screen.queryByText('voter.room.voted_help')).toBeNull()
      expect(screen.queryByText('voter.room.voted_elsewhere')).toBeNull()
      pushServer(qbqProcess(['RESULTS', 'RESULTS', 'PAUSED'], [4, 1, 0]))
      await onScreen('roomNone')
      pushServer(qbqProcess(['RESULTS', 'RESULTS', 'ONGOING'], [4, 1, 0]))
      await onScreen('roomQuestion')
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 3')
    })

    it('a vote cast from another device meanwhile: pressing "Emet el vot" re-checks first and ends on frame 3, not an error', async () => {
      server.process = qbqProcess(['ONGOING', 'PAUSED', 'PAUSED'])
      renderPage(server.process)
      await identify('roomQuestion')
      fireEvent.click(within(current()).getByDisplayValue('0'))
      await waitFor(() => expect(screen.getByTestId('voter-cast')).not.toHaveAttribute('aria-disabled'))
      // The other device voted; this page has not heard of it (no focus, no poll).
      server.voted.add('q1')
      fireEvent.click(screen.getByTestId('voter-cast'))
      await onScreen('roomVoted')
      expect(screen.queryByRole('alert')).toBeNull()
      // It says the vote on record came from elsewhere, not from this press.
      expect(await screen.findByText('voter.room.voted_elsewhere')).toBeInTheDocument()
      // Nothing of this device's answer was sent.
      expect(server.batches).toEqual([])
    })

    // Two open questions are answered in one form and cast in one batch, which the CSP authorises whole or not at all.
    const answerBoth = async () => {
      server.process = qbqProcess(['ONGOING', 'ONGOING', 'PAUSED'])
      renderPage(server.process)
      await identify('question')
      // A single choice moves on by itself: question 1, question 2, then the review.
      fireEvent.click(within(current()).getByDisplayValue('0'))
      await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Question 2'))
      fireEvent.click(within(current()).getByDisplayValue('0'))
      await onScreen('review')
      // The review arms its button after a moment, against a double tap.
      await waitFor(() => expect(screen.getByTestId('voter-cast')).toBeEnabled(), { timeout: 4000 })
    }

    it('casts an open set in one batch', async () => {
      await answerBoth()
      fireEvent.click(screen.getByTestId('voter-cast'))
      await onScreen('roomVoted')
      expect(server.batches).toEqual([['q1', 'q2']])
      expect([...server.voted]).toEqual(['q1', 'q2'])
      expect(screen.queryByText('voter.room.late_dropped')).toBeNull()
    })

    it.each([
      { closes: 'the first', statuses: ['RESULTS', 'ONGOING', 'PAUSED'] as Status[], left: 'q2' },
      { closes: 'another', statuses: ['ONGOING', 'RESULTS', 'PAUSED'] as Status[], left: 'q1' },
    ])(
      '$closes question of the set closes as it is cast: the rest is sent again and the closed one reads late',
      async ({ statuses, left }) => {
        await answerBoth()
        // The backend closed it; the page has not read it yet, so the batch still carries it and is refused whole.
        server.process = qbqProcess(statuses)
        fireEvent.click(screen.getByTestId('voter-cast'))
        await onScreen('roomVoted')
        expect(server.batches).toEqual([['q1', 'q2'], [left]])
        expect([...server.voted]).toEqual([left])
        // No failure is shown: the vote that could still count was cast, and the frame names the one that was late.
        expect(screen.queryByRole('alert')).toBeNull()
        expect(screen.getByText('voter.room.late_dropped')).toBeInTheDocument()
      }
    )

    it('sends the rest again only once: a second refusal shows as a failed cast', async () => {
      await answerBoth()
      server.process = qbqProcess(['RESULTS', 'ONGOING', 'PAUSED'])
      server.failBatch = 2
      fireEvent.click(screen.getByTestId('voter-cast'))
      await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument(), { timeout: 4000 })
      expect(server.batches).toEqual([['q1', 'q2'], ['q2']])
      expect(server.voted.size).toBe(0)
    })

    it('a question that closes as it is cast: nothing is signed, the facts show 3c', async () => {
      server.process = qbqProcess(['ONGOING', 'PAUSED', 'PAUSED'])
      renderPage(server.process)
      await identify('roomQuestion')
      fireEvent.click(within(current()).getByDisplayValue('0'))
      await waitFor(() => expect(screen.getByTestId('voter-cast')).not.toHaveAttribute('aria-disabled'))
      // The backend closed it; the page has not read it yet.
      server.process = qbqProcess(['RESULTS', 'PAUSED', 'PAUSED'], [2, 0, 0])
      fireEvent.click(screen.getByTestId('voter-cast'))
      await onScreen('roomMissed')
      expect(server.voted.size).toBe(0)
    })
  })
})
