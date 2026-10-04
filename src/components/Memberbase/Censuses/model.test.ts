import type { Group } from '~src/queries/groups'
import type { VoteGroupMarker } from '~src/queries/voteGroups'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { buildCensusIndex, censusSourceOf, resolveCensus, voteCensusDeletion } from './model'

const past = new Date(Date.now() - 86_400_000).toISOString()
const future = new Date(Date.now() + 86_400_000).toISOString()

const vote = (
  id: string,
  census: Record<string, unknown>,
  status: string,
  { published = true, maxVoters }: { published?: boolean; maxVoters?: number } = {}
) =>
  ({
    id,
    title: { default: id },
    census,
    questions: [{ status, results: maxVoters ? { maxVoters } : undefined }],
    published,
    startDate: status === 'UPCOMING' ? future : past,
  }) as never

const group = (id: string, extra: Partial<Group> = {}) =>
  ({
    id,
    title: id,
    description: '',
    membersCount: 3,
    censusIds: [],
    createdAt: past,
    updatedAt: past,
    ...extra,
  }) as Group

const markers = new Map<string, VoteGroupMarker>([['owned', { processId: 'p-own', kind: 'snapshot', createdAt: past }]])
const groups = [group('everyone', { isAutoGroup: true, membersCount: 1742 }), group('quota'), group('owned')]
const groupsById = new Map(groups.map((entry) => [entry.id, entry]))
const context = { everyoneId: 'everyone', markers, groupsById }

describe('censusSourceOf', () => {
  it('tells Everyone, a vote’s own census, a shared saved census and picked people apart', () => {
    expect(censusSourceOf(vote('a', { groupId: 'everyone' }, 'ONGOING'), context)).toEqual({ kind: 'everyone' })
    expect(censusSourceOf(vote('b', { groupId: 'owned' }, 'ONGOING'), context)).toEqual({
      kind: 'snapshot',
      groupId: 'owned',
      // When it was copied from every member, to say so
      madeAt: past,
    })
    expect(censusSourceOf(vote('c', { groupId: 'quota' }, 'ONGOING'), context)).toMatchObject({ kind: 'saved' })
    expect(censusSourceOf(vote('d', {}, 'ONGOING'), context)).toEqual({ kind: 'selected' })
    // A group deleted since behaves like picked people
    expect(censusSourceOf(vote('e', { groupId: 'gone' }, 'ONGOING'), context)).toEqual({ kind: 'selected' })
  })
})

describe('buildCensusIndex', () => {
  it('leaves Everyone and vote-owned groups out of the saved censuses', () => {
    const index = buildCensusIndex({
      groups,
      published: [vote('p1', { groupId: 'quota' }, 'ONGOING')],
      drafts: [vote('d1', { groupId: 'quota' }, 'UPCOMING', { published: false })],
      markers,
      language: 'en',
    })

    expect(index.everyone?.id).toBe('everyone')
    expect(index.saved.map((row) => row.group.id)).toEqual(['quota'])
    expect(index.saved[0].usedBy.map((used) => used.state)).toEqual(['live', 'draft'])
    expect(index.total).toBe(3)
  })
})

describe('resolveCensus', () => {
  const base = { markers, groupsById, everyoneId: 'everyone', processes: [] as never[] }

  it('makes Everyone read-only', () => {
    const census = resolveCensus({ ...base, kind: 'saved', group: groups[0] })
    expect(census).toMatchObject({ kind: 'everyone', edit: 'none', readOnly: 'everyone', count: 1742, browse: 'group' })
  })

  it('edits a saved census through its group and lists the votes sharing it', () => {
    const census = resolveCensus({
      ...base,
      kind: 'saved',
      group: { id: 'quota', memberIds: ['a', 'b'] },
      processes: [vote('p1', { groupId: 'quota' }, 'RESULTS')],
    })
    expect(census).toMatchObject({ kind: 'saved', edit: 'group', count: 2 })
    expect(census.readOnly).toBeUndefined()
    expect(census.sharedWith).toEqual([{ id: 'p1', title: 'p1', state: 'closed' }])
  })

  it('edits a live vote’s own census through its group', () => {
    const census = resolveCensus({
      ...base,
      kind: 'vote',
      process: vote('p-own', { groupId: 'owned', size: 40 }, 'ONGOING'),
    })
    expect(census).toMatchObject({ edit: 'group', groupId: 'owned', count: 40, state: 'live', browse: 'group' })
  })

  it('locks the census of a vote that has ended, and counts its voters on chain', () => {
    const census = resolveCensus({
      ...base,
      kind: 'vote',
      process: vote('p-own', { groupId: 'owned', size: 38 }, 'RESULTS', { maxVoters: 40 }),
    })
    expect(census).toMatchObject({ edit: 'none', readOnly: 'ended', count: 40, atClose: true })
  })

  it('edits a published vote following Everyone through its own census, with a lookup instead of a list', () => {
    const census = resolveCensus({ ...base, kind: 'vote', process: vote('p', { groupId: 'everyone' }, 'ONGOING') })
    expect(census).toMatchObject({ edit: 'process', browse: 'lookup', source: { kind: 'everyone' } })
    expect(census.readOnly).toBeUndefined()
  })

  it('keeps a draft following Everyone read-only: it gets its own list at publish', () => {
    const census = resolveCensus({
      ...base,
      kind: 'vote',
      process: vote('p', { groupId: 'everyone' }, 'UPCOMING', { published: false }),
    })
    expect(census).toMatchObject({ edit: 'none', readOnly: 'follows_everyone', browse: 'lookup' })
  })

  it('edits picked people of a published vote through the vote’s census, and not in a draft', () => {
    expect(resolveCensus({ ...base, kind: 'vote', process: vote('p', {}, 'ONGOING') })).toMatchObject({
      edit: 'process',
      browse: 'lookup',
    })
    expect(
      resolveCensus({ ...base, kind: 'vote', process: vote('p', {}, 'UPCOMING', { published: false }) })
    ).toMatchObject({ edit: 'none', readOnly: 'draft_selected', state: 'draft' })
  })

  it('edits a published vote on a shared saved census through its own census, leaving the others alone', () => {
    const shared = vote('p1', { groupId: 'quota' }, 'ONGOING')
    const census = resolveCensus({
      ...base,
      kind: 'vote',
      process: shared,
      processes: [shared, vote('p2', { groupId: 'quota' }, 'RESULTS')],
    })
    expect(census).toMatchObject({ edit: 'process', browse: 'lookup', groupId: undefined, sharedWith: [] })
  })

  it('keeps a draft on a saved census read-only, naming the votes sharing it', () => {
    const draft = vote('d1', { groupId: 'quota' }, 'UPCOMING', { published: false })
    const census = resolveCensus({
      ...base,
      kind: 'vote',
      process: draft,
      processes: [draft, vote('p2', { groupId: 'quota' }, 'RESULTS')],
    })
    expect(census).toMatchObject({ edit: 'none', readOnly: 'draft_saved', browse: 'group', groupId: 'quota' })
    expect(census.sharedWith.map((entry) => entry.id)).toEqual(['d1', 'p2'])
  })
})

describe('voteCensusDeletion', () => {
  const marker = { processId: 'p1', kind: 'copy' as const, createdAt: '2026-10-01T10:00:00Z' }
  const base = {
    kind: 'vote' as const,
    groupId: 'g1',
    process: { id: 'p1' } as VotingProcessResponse,
    markers: new Map([['g1', marker]]),
  }

  it('lets a draft, canceled or ended vote delete its own census, and keeps an open one', () => {
    expect(voteCensusDeletion({ ...base, state: 'draft' })).toBe('draft')
    expect(voteCensusDeletion({ ...base, state: 'canceled' })).toBe('canceled')
    expect(voteCensusDeletion({ ...base, state: 'ended' })).toBe('ended')
    for (const state of ['live', 'paused', 'scheduled'] as const)
      expect(voteCensusDeletion({ ...base, state })).toBe('blocked')
  })

  it('never offers to delete a group the vote does not own', () => {
    expect(voteCensusDeletion({ ...base, state: 'draft', markers: new Map() })).toBe('none')
    expect(
      voteCensusDeletion({ ...base, state: 'draft', markers: new Map([['g1', { ...marker, processId: 'p2' }]]) })
    ).toBe('none')
    expect(voteCensusDeletion({ ...base, state: 'draft', groupId: undefined })).toBe('none')
  })
})
