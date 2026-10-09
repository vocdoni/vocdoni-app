import type { VotingProcessResponse } from '@vocdoni/api-types'
import { createElection, createQuestion } from '~components/Process/VotingReportPdf/__fixtures__'
import { fetchOnChainEndDate, getEarlyEndDate, hasStoppedVoting } from './process-end-date'

const onChain = (endDate: string) => ({ ok: true, json: async () => ({ endDate }) }) as Response

const withQuestions = (upstreamIds: (string | undefined)[], overrides = {}) =>
  createElection({
    questions: upstreamIds.map((upstreamId, index) => createQuestion({ id: `q${index}`, upstreamId })),
    ...overrides,
  }) as VotingProcessResponse

describe('fetchOnChainEndDate', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('reads the chain the process was anchored to, not the configured environment', async () => {
    // A staging process can be anchored to the production chain, so the gateway follows `chainId`.
    const fetchMock = vi.fn(async (_url: string) => onChain('2026-01-01T15:42:00Z'))
    vi.stubGlobal('fetch', fetchMock)

    await fetchOnChainEndDate(withQuestions(['up-1'], { chainId: 'vocdoni/LTS/1.2' }))
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.vocdoni.io/v2/elections/up-1')

    fetchMock.mockClear()
    await fetchOnChainEndDate(withQuestions(['up-1'], { chainId: 'vocdoni/DEV/36' }))
    expect(fetchMock.mock.calls[0][0]).toBe('https://api-dev.vocdoni.net/v2/elections/up-1')
  })

  it('reads the configured Vochain API instead of the chain gateway when one is set', async () => {
    const fetchMock = vi.fn(async (_url: string) => onChain('2026-01-01T15:42:00Z'))
    vi.stubGlobal('fetch', fetchMock)

    await fetchOnChainEndDate(withQuestions(['up-1'], { chainId: 'vocdoni/LTS/1.2' }), 'http://localhost:9090/v2')
    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:9090/v2/elections/up-1')
  })

  it('ends when the last question ends', async () => {
    // Each question is its own election and they stop seconds apart, so the latest one wins.
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => onChain(url.endsWith('up-1') ? '2026-09-09T12:08:43Z' : '2026-09-09T12:08:55Z'))
    )

    const endDate = await fetchOnChainEndDate(withQuestions(['up-1', 'up-2']))

    expect(endDate?.toISOString()).toBe('2026-09-09T12:08:55.000Z')
  })

  it('returns null when the chain cannot be read, so callers keep the configured date', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false }) as Response)
    )
    expect(await fetchOnChainEndDate(withQuestions(['up-1']))).toBeNull()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('offline')
      })
    )
    expect(await fetchOnChainEndDate(withQuestions(['up-1']))).toBeNull()
  })

  it('does not call the gateway for a process with no on-chain questions', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchOnChainEndDate(withQuestions([undefined]))).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('getEarlyEndDate', () => {
  // The fixture process is configured to end at 2026-01-02T10:00:00Z.
  const election = createElection() as VotingProcessResponse

  it('reports a process that was stopped ahead of schedule', () => {
    expect(getEarlyEndDate(election, new Date('2026-01-01T15:42:00Z'))?.toISOString()).toBe('2026-01-01T15:42:00.000Z')
  })

  it('ignores the seconds of block drift of a process that ran its course', () => {
    // The chain stops at the block crossing `endDate`, so a natural end lands just either side of it.
    expect(getEarlyEndDate(election, new Date('2026-01-02T09:59:55Z'))).toBeNull()
    expect(getEarlyEndDate(election, new Date('2026-01-02T10:00:04Z'))).toBeNull()
  })

  it('reports nothing when the chain could not be read', () => {
    expect(getEarlyEndDate(election, null)).toBeNull()
  })
})

describe('hasStoppedVoting', () => {
  const withStatus = (status: string) =>
    createElection({ questions: [createQuestion({ status: status as never })] }) as VotingProcessResponse

  it('is true once the process stopped accepting votes, however it got there', () => {
    expect(hasStoppedVoting(withStatus('RESULTS'))).toBe(true)
    expect(hasStoppedVoting(withStatus('ENDED'))).toBe(true)
    expect(hasStoppedVoting(withStatus('CANCELED'))).toBe(true)
  })

  it('is false while the process can still receive votes', () => {
    expect(hasStoppedVoting(withStatus('ONGOING'))).toBe(false)
    expect(hasStoppedVoting(withStatus('PAUSED'))).toBe(false)
    expect(hasStoppedVoting(null)).toBe(false)
  })
})
