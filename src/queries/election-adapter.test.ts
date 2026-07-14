import type { Election as SaasElection } from '@vocdoni/api-types'
import { ElectionResultsTypeNames, ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import { describe, expect, it } from 'vitest'
import { toPublishedElection } from './election-adapter'

const baseElection = (overrides: Partial<SaasElection> = {}): SaasElection => ({
  id: 'mongoid',
  address: '0xabc',
  chainId: 'vocdoni/DEV/1',
  title: { default: 'My election' },
  description: { default: 'A description' },
  status: 'READY',
  // In the past, so READY resolves to ONGOING rather than UPCOMING.
  startDate: '2020-01-01T00:00:00.000Z',
  endDate: '2020-02-01T00:00:00.000Z',
  organizationId: '0xorg',
  voteCount: 8,
  finalResults: false,
  results: [['5', '3']],
  census: { id: 'cid', type: 'csp', size: 100, uri: 'ipfs://census' },
  questions: [
    {
      title: { default: 'Q1' },
      choices: [
        { title: { default: 'A' }, value: 0 },
        { title: { default: 'B' }, value: 1 },
      ],
    },
  ],
  voteType: {
    maxCount: 1,
    maxValue: 1,
    maxVoteOverwrites: 0,
    costExponent: 1,
    uniqueChoices: true,
    costFromWeight: false,
  },
  electionType: { interruptible: true, secretUntilTheEnd: false, anonymous: false },
  ...overrides,
})

describe('toPublishedElection', () => {
  it('builds a PublishedElection with the core fields mapped', () => {
    const election = toPublishedElection(baseElection())

    expect(election).toBeInstanceOf(PublishedElection)
    expect(election.id).toBe('mongoid')
    expect(election.organizationId).toBe('0xorg')
    expect(election.chainId).toBe('vocdoni/DEV/1')
    expect(election.voteCount).toBe(8)
    expect(election.title.default).toBe('My election')
    expect(election.description.default).toBe('A description')
  })

  it('normalizes ISO date strings into Date instances', () => {
    const election = toPublishedElection(baseElection())

    expect(election.startDate).toBeInstanceOf(Date)
    expect(election.startDate.toISOString()).toBe('2020-01-01T00:00:00.000Z')
    expect(election.endDate.toISOString()).toBe('2020-02-01T00:00:00.000Z')
  })

  it('wraps bare-string localized text as a { default } multilang object', () => {
    const election = toPublishedElection(baseElection({ title: 'Plain title' }))

    expect(election.title.default).toBe('Plain title')
  })

  describe('status synthesis', () => {
    it('maps READY with a past start date to ONGOING', () => {
      const election = toPublishedElection(baseElection({ status: 'READY' }))
      expect(election.status).toBe(ElectionStatus.ONGOING)
    })

    it('maps READY with a future start date to UPCOMING', () => {
      const election = toPublishedElection(baseElection({ status: 'READY', startDate: '2999-01-01T00:00:00.000Z' }))
      expect(election.status).toBe(ElectionStatus.UPCOMING)
    })

    it('synthesizes RESULTS for an ended election with final results', () => {
      const election = toPublishedElection(baseElection({ status: 'ENDED', finalResults: true }))
      expect(election.status).toBe(ElectionStatus.RESULTS)
    })

    it('keeps ENDED when results are not yet final', () => {
      const election = toPublishedElection(baseElection({ status: 'ENDED', finalResults: false }))
      expect(election.status).toBe(ElectionStatus.ENDED)
    })

    it('passes PAUSED and CANCELED through unchanged', () => {
      expect(toPublishedElection(baseElection({ status: 'PAUSED' })).status).toBe(ElectionStatus.PAUSED)
      expect(toPublishedElection(baseElection({ status: 'CANCELED' })).status).toBe(ElectionStatus.CANCELED)
    })
  })

  describe('results', () => {
    it('projects the raw histogram onto per-choice tallies', () => {
      const election = toPublishedElection(baseElection())

      expect(election.questions[0].choices[0].results).toBe('5')
      expect(election.questions[0].choices[1].results).toBe('3')
    })

    it('leaves choice tallies undefined when there are no results yet', () => {
      const election = toPublishedElection(baseElection({ results: [] }))

      expect(election.questions[0].choices[0].results).toBeUndefined()
    })

    it('infers a single-choice results type', () => {
      const election = toPublishedElection(baseElection())

      expect(election.resultsType?.name).toBe(ElectionResultsTypeNames.SINGLE_CHOICE_MULTIQUESTION)
    })

    it('infers a multichoice results type and unifies the abstain bucket', () => {
      const election = toPublishedElection(
        baseElection({
          voteType: {
            maxCount: 2,
            maxValue: 2,
            maxVoteOverwrites: 0,
            costExponent: 1,
            uniqueChoices: false,
            costFromWeight: false,
          },
          questions: [
            {
              title: { default: 'Pick some' },
              choices: [
                { title: { default: 'A' }, value: 0 },
                { title: { default: 'B' }, value: 1 },
                { title: { default: 'C' }, value: 2 },
              ],
            },
          ],
          // Columns 0..2 are real choices; column 3 is a reserved abstain sentinel.
          results: [['1', '2', '3', '4']],
        })
      )

      expect(election.resultsType?.name).toBe(ElectionResultsTypeNames.MULTIPLE_CHOICE)
      expect(election.questions[0].choices.map((c) => c.results)).toEqual(['1', '2', '3'])
      expect(election.questions[0].numAbstains).toBe('4')
    })
  })

  describe('census', () => {
    it('builds a published census from the census info', () => {
      const election = toPublishedElection(baseElection())

      expect(election.census.censusURI).toBe('ipfs://census')
      expect(election.census.size).toBe(100)
    })
  })
})
