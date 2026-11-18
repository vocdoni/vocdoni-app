import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { electionQueryKeys } from '@vocdoni/react-components'
import { QueryClient } from '@tanstack/react-query'
import { voteNullifier } from '@vocdoni/api-voting'
import i18n from 'i18next'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
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
const single = (n: number, status: Status, voteCount = 0) => ({
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
  secretUntilTheEnd: false,
  status,
  metadata: {},
  results: { voteCount, maxVoters: 10, finalResults: status === 'RESULTS', results: [] },
})
const makeProcess = ({
  status = 'ONGOING' as Status,
  startDate = '2026-06-01T00:00:00.000Z',
  endDate = '2026-12-01T00:00:00.000Z',
  voteCount = 0,
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
    questions: [single(1, status, voteCount), single(2, status, voteCount)],
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
  if (server.offline) throw new TypeError('Failed to fetch')
  if (pathname === '/processes/p1/check') {
    return json(200, {
      belongsToProcess: true,
      questions: ['q1', 'q2'].map((id, i) => ({
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
      } catch (e) {
          }
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
  fetchStub.mock.calls.filter(([input]) => (input instanceof Request ? input.url : String(input)).includes('sign-batch'))

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

  it('a cancel moves any screen to canceled', async () => {
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
    expect(screen.getByTestId('vote-receipt')).toHaveTextContent('vote-1'.slice(0, 4))
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
    ['unsupported', true],
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
