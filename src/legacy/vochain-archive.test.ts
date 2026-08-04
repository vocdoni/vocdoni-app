import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  fetchLegacyElection,
  fetchLegacyOrganization,
  fetchLegacyOrganizationElections,
  getVochainGatewayUrl,
  isLegacyProcessId,
  VochainNotFoundError,
} from './vochain-archive'

// Recorded from api.vocdoni.io on 2026-07-23 (trimmed to the fields the archive reads)
const rawElection = {
  electionId: '6b342d99f2183d500f14d30d468baee8f4125b02e93697d5d5ee02000000004c',
  organizationId: '3d500f14d30d468baee8f4125b02e93697d5d5ee',
  status: 'RESULTS',
  startDate: '2026-01-21T22:47:56Z',
  endDate: '2026-02-19T19:47:47Z',
  voteCount: 10,
  finalResults: true,
  chainId: 'vocdoni/LTS/1.2',
  result: [['7', '3']],
  census: { maxCensusSize: 200 },
  voteMode: { encryptedVotes: false, uniqueValues: false, costFromWeight: false },
  tallyMode: { maxCount: 1, maxValue: 1, maxVoteOverwrites: 0, maxTotalCost: 0, costExponent: 1 },
  metadata: {
    title: { default: 'Legacy annual vote' },
    description: { default: 'A finished legacy process' },
    media: {},
    questions: [
      {
        title: { default: 'Board continuity' },
        choices: [
          { title: { default: 'Approve' }, value: 0 },
          { title: { default: 'Reject' }, value: 1 },
        ],
      },
    ],
  },
}

const gateway = getVochainGatewayUrl('prod')

const mockFetchJson = (payload: unknown, status = 200) =>
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify(payload), { status }) as Response)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isLegacyProcessId', () => {
  it('matches 64-hex vochain ids with or without 0x and rejects Mongo ids', () => {
    expect(isLegacyProcessId(rawElection.electionId)).toBe(true)
    expect(isLegacyProcessId(`0x${rawElection.electionId}`)).toBe(true)
    expect(isLegacyProcessId('6a3cfc6b3af4e390f5f79291')).toBe(false)
    expect(isLegacyProcessId(undefined)).toBe(false)
  })
})

describe('fetchLegacyElection', () => {
  it('maps the gateway election with decoded per-choice tallies', async () => {
    mockFetchJson(rawElection)

    const election = await fetchLegacyElection(gateway, rawElection.electionId)

    expect(election).toMatchObject({
      id: rawElection.electionId,
      organizationId: rawElection.organizationId,
      status: 'RESULTS',
      voteCount: 10,
      maxCensusSize: 200,
      secretUntilTheEnd: false,
      resultsAvailable: true,
      title: { default: 'Legacy annual vote' },
    })
    expect(election.questions[0].choices).toEqual([
      { title: { default: 'Approve' }, value: 0, votes: 7, percentage: 70 },
      { title: { default: 'Reject' }, value: 1, votes: 3, percentage: 30 },
    ])
  })

  it('hides tallies for secret elections without final results', async () => {
    mockFetchJson({
      ...rawElection,
      status: 'ENDED',
      finalResults: false,
      voteMode: { ...rawElection.voteMode, encryptedVotes: true },
    })

    const election = await fetchLegacyElection(gateway, rawElection.electionId)

    expect(election.resultsAvailable).toBe(false)
    expect(election.questions[0].choices[0].votes).toBeNull()
  })

  it('splits READY into upcoming and ongoing by start date', async () => {
    mockFetchJson({ ...rawElection, status: 'READY', startDate: '2099-01-01T00:00:00Z' })
    expect((await fetchLegacyElection(gateway, rawElection.electionId)).status).toBe('UPCOMING')

    vi.restoreAllMocks()
    mockFetchJson({ ...rawElection, status: 'READY', startDate: '2020-01-01T00:00:00Z' })
    expect((await fetchLegacyElection(gateway, rawElection.electionId)).status).toBe('ONGOING')
  })

  it('throws VochainNotFoundError on gateway 404s and non-legacy ids', async () => {
    mockFetchJson({ error: 'not found' }, 404)

    await expect(fetchLegacyElection(gateway, rawElection.electionId)).rejects.toBeInstanceOf(VochainNotFoundError)
    await expect(fetchLegacyElection(gateway, '6a3cfc6b3af4e390f5f79291')).rejects.toBeInstanceOf(VochainNotFoundError)
  })
})

describe('fetchLegacyOrganization', () => {
  it('maps the inline account metadata', async () => {
    mockFetchJson({
      address: rawElection.organizationId,
      electionIndex: 77,
      metadata: {
        name: { default: 'D5 Square' },
        description: { default: 'A legacy org' },
        media: { avatar: 'https://example.test/avatar.png' },
      },
    })

    await expect(fetchLegacyOrganization(gateway, `0x${rawElection.organizationId}`)).resolves.toEqual({
      address: rawElection.organizationId,
      account: {
        name: { default: 'D5 Square' },
        description: { default: 'A legacy org' },
        avatar: 'https://example.test/avatar.png',
      },
      electionCount: 77,
    })
  })

  it('rejects malformed addresses without hitting the gateway', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')

    await expect(fetchLegacyOrganization(gateway, 'not-an-address')).rejects.toBeInstanceOf(VochainNotFoundError)
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('fetchLegacyOrganizationElections', () => {
  it('lists a page and resolves titles through per-election detail reads', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/elections/page/')) {
        return new Response(
          JSON.stringify({
            elections: [
              {
                electionId: rawElection.electionId,
                organizationId: rawElection.organizationId,
                status: 'RESULTS',
                startDate: rawElection.startDate,
                endDate: rawElection.endDate,
                voteCount: 10,
                finalResults: true,
              },
            ],
            pagination: { totalItems: 1, previousPage: null, currentPage: 0, nextPage: null, lastPage: 0 },
          }),
          { status: 200 }
        ) as Response
      }
      return new Response(JSON.stringify(rawElection), { status: 200 }) as Response
    })

    const page = await fetchLegacyOrganizationElections(gateway, rawElection.organizationId, 0)

    expect(page.elections).toHaveLength(1)
    expect(page.elections[0]).toMatchObject({
      id: rawElection.electionId,
      title: { default: 'Legacy annual vote' },
      status: 'RESULTS',
    })
    expect(page.pagination).toEqual({ totalItems: 1, previousPage: null, currentPage: 0, nextPage: null, lastPage: 0 })
    expect(fetchSpy).toHaveBeenCalledTimes(2)
  })
})
