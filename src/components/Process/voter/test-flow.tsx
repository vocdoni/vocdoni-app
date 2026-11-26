import type { VotingProcessResponse } from '@vocdoni/api-types'
import type i18n from 'i18next'
import type { ReactElement, ReactNode } from 'react'
import { render } from '~src/test-utils'
import type { AppEnv } from '~src/app-env-build'
import { VoterFlowContext, type VoterFlow } from './flow-context'
import { initialVoterState, type RoomCast, type RoomFacts, type VoterFacts } from './voter-flow'
import type { QuestionState, VoteState } from '~utils/vote-state'

/** A two-question single-choice vote, open until 2026-12-01, for the screen tests. */
export const testElection = (over: Partial<Record<string, unknown>> = {}) =>
  ({
    id: 'p1',
    orgAddress: 'abc',
    chainId: 'vocdoni/LTS/1',
    title: { default: 'Assemblea General' },
    description: { default: '' },
    header: '',
    published: true,
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-12-01T19:00:00.000Z',
    census: { authFields: ['memberNumber'], twoFaFields: [], weighted: false, anonymous: false },
    questions: [1, 2].map((n) => ({
      id: `q${n}`,
      title: { default: `Question ${n}` },
      description: { default: '' },
      choices: [
        { title: { default: `Yes ${n}` }, value: 0 },
        { title: { default: `No ${n}` }, value: 1 },
      ],
      type: 'singlechoice',
      status: 'ONGOING',
      results: { voteCount: 184, maxVoters: 312 },
    })),
    ...over,
  }) as unknown as VotingProcessResponse

export const testFacts = (over: Partial<VoterFacts> = {}): VoterFacts => ({
  loaded: true,
  status: 'ONGOING',
  room: null,
  endedBySchedule: false,
  secretUntilTheEnd: false,
  resultsShown: true,
  connected: true,
  challengePending: false,
  membership: 'ok',
  voterStateReady: true,
  hasVoted: false,
  isAbleToVote: true,
  voting: false,
  everyQuestionSettled: false,
  questionCount: 2,
  answered: [false, false],
  ...over,
})

/** A question-by-question room for the screen tests: q1, q2… in these states, cast as given. */
export const testRoom = (
  questions: Array<QuestionState | [QuestionState, RoomCast]>,
  voteState: VoteState = 'live'
): RoomFacts => ({
  voteState,
  questions: questions.map((entry, index) => {
    const [state, cast] = Array.isArray(entry) ? entry : [entry, 'none' as RoomCast]
    return { id: `q${index + 1}`, state, cast, endedAt: null }
  }),
})

/** A flow value for a screen test: every action is a spy. */
export const testFlow = (over: Partial<VoterFlow> = {}): VoterFlow => ({
  screen: { kind: 'welcome' },
  moved: false,
  election: testElection(),
  brand: { branded: false, name: 'Ateneu de Vallnova' },
  facts: testFacts(),
  state: initialVoterState,
  weight: null,
  weighted: false,
  anonymous: false,
  voteIds: {},
  lockedNotice: () => undefined,
  statuses: [],
  chain: [],
  start: vi.fn(),
  next: vi.fn(),
  back: vi.fn(),
  goTo: vi.fn(),
  change: vi.fn(),
  review: vi.fn(),
  chooseBlank: vi.fn(),
  cast: vi.fn(async () => undefined),
  casting: false,
  signOut: vi.fn(),
  showResults: vi.fn(),
  checkReceipt: vi.fn(),
  recheck: vi.fn(),
  verifyReceipt: vi.fn(),
  park: vi.fn(),
  skip: vi.fn(),
  resume: vi.fn(),
  castQuestion: vi.fn(async () => undefined),
  leaveReceipt: vi.fn(),
  form: null,
  ...over,
})

type RenderOptions = { appEnv?: Partial<AppEnv>; i18nInstance?: typeof i18n }

/** Renders a screen with this flow; the strings are the keys unless an i18n instance with resources is given. */
export const renderWithFlow = (ui: ReactElement, flow: VoterFlow, { appEnv, i18nInstance }: RenderOptions = {}) =>
  render(ui, {
    appEnv,
    i18nInstance,
    wrapper: ({ children }: { children: ReactNode }) => (
      <VoterFlowContext.Provider value={flow}>{children}</VoterFlowContext.Provider>
    ),
  })
