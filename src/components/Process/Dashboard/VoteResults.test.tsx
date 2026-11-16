import type { VotingProcessResponse } from '@vocdoni/api-types'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { VoteResults } from './VoteResults'

let resultsThrow = false

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionResults: () => {
      if (resultsThrow) throw new Error('cannot infer ballot type')
      return <div>ElectionResults</div>
    },
  }
})

vi.mock('~queries/census', () => ({ useCensusSize: () => ({ size: 10 }) }))
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: vi.fn(),
}))

const election = (canceled = false) =>
  ({
    id: '0xabc',
    orgAddress: '0xorg',
    title: { default: 'Test election' },
    startDate: '2026-01-01T10:00:00Z',
    endDate: '2026-01-02T10:00:00Z',
    published: true,
    census: {},
    questions: [{ id: 'q1', title: { default: 'Q' }, choices: [], status: canceled ? 'CANCELED' : 'RESULTS' }],
  }) as unknown as VotingProcessResponse

const mountWith = (process: VotingProcessResponse) => {
  setReactProvidersMock({ useElection: () => ({ election: process, status: 'RESULTS', results: null }) })
  return render(
    <TestMemoryRouter initialEntries={['/admin/process/0xabc/results']}>
      <VoteResults />
    </TestMemoryRouter>
  )
}

describe('VoteResults', () => {
  beforeEach(() => vi.mocked(trackAnalyticsEvent).mockClear())
  afterEach(() => {
    resultsThrow = false
  })

  it('keeps the page up when the results cannot render', async () => {
    resultsThrow = true
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      mountWith(election())
      expect(await screen.findByText('This section could not be loaded')).toBeInTheDocument()
    } finally {
      consoleError.mockRestore()
    }
  })

  it('fires ProcessResultsViewed once per election', () => {
    const { rerender } = mountWith(election())
    rerender(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc/results']}>
        <VoteResults />
      </TestMemoryRouter>
    )

    const calls = vi
      .mocked(trackAnalyticsEvent)
      .mock.calls.filter(([e]) => e.name === AnalyticsEvents.ProcessResultsViewed)
    expect(calls).toHaveLength(1)
  })

  it('sends a canceled vote back to the summary', () => {
    mountWith(election(true))

    expect(screen.queryByText('ElectionResults')).toBeNull()
    expect(trackAnalyticsEvent).not.toHaveBeenCalled()
  })
})
