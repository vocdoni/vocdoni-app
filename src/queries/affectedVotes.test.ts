import { renderHook } from '@testing-library/react'
import { useAffectedVotes, votesFollowingGroup } from './affectedVotes'

const past = new Date(Date.now() - 86_400_000).toISOString()
const future = new Date(Date.now() + 86_400_000).toISOString()

const vote = (id: string, title: string, groupId: string, status: string, published = true, startDate = past) =>
  ({
    id,
    title: { default: title },
    census: { groupId },
    questions: [{ status }],
    published,
    startDate,
  }) as never

const data = vi.hoisted(() => ({
  groups: [] as { id: string; isAutoGroup?: boolean }[],
  published: [] as unknown[],
  drafts: [] as unknown[],
}))

vi.mock('./groups', () => ({
  useAllGroups: () => ({ data: data.groups, isLoading: false }),
}))

vi.mock('./processes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./processes')>()
  return {
    ...actual,
    usePublishedProcesses: () => ({ data: { pages: [{ processes: data.published }] }, isLoading: false }),
    useDraftProcesses: () => ({ data: { pages: [{ processes: data.drafts }] }, isLoading: false }),
  }
})

describe('votesFollowingGroup', () => {
  it('keeps only the votes on that group, live first and closed last', () => {
    const votes = votesFollowingGroup(
      [
        vote('1', 'Eleccions Junta 2025', 'everyone', 'RESULTS'),
        vote('2', 'Assemblea General 2026', 'everyone', 'ONGOING'),
        vote('3', 'Board only', 'board', 'ONGOING'),
        vote('4', 'Pressupost', 'everyone', 'UPCOMING', true, future),
        vote('5', 'Draft', 'everyone', 'UPCOMING', false),
      ],
      'everyone'
    )

    expect(votes).toEqual([
      { id: '2', title: 'Assemblea General 2026', state: 'live' },
      { id: '4', title: 'Pressupost', state: 'scheduled' },
      { id: '5', title: 'Draft', state: 'draft' },
      { id: '1', title: 'Eleccions Junta 2025', state: 'closed' },
    ])
  })

  it('finds nothing without a group', () => {
    expect(votesFollowingGroup([vote('1', 'A', 'everyone', 'ONGOING')], undefined)).toEqual([])
  })
})

describe('useAffectedVotes', () => {
  it('follows the auto "Everyone" group across published votes and drafts', () => {
    data.groups = [{ id: 'everyone', isAutoGroup: true }, { id: 'board' }]
    data.published = [vote('1', 'Closed one', 'everyone', 'RESULTS'), vote('2', 'Board', 'board', 'ONGOING')]
    data.drafts = [vote('3', 'Next AGM', 'everyone', 'UPCOMING', false)]

    const { result } = renderHook(() => useAffectedVotes())

    expect(result.current.everyoneGroupId).toBe('everyone')
    expect(result.current.votes.map((entry) => entry.id)).toEqual(['3', '1'])
    expect(result.current.hasActive).toBe(false)
  })

  it('says when a live vote follows Everyone', () => {
    data.groups = [{ id: 'everyone', isAutoGroup: true }]
    data.published = [vote('1', 'AGM', 'everyone', 'ONGOING')]
    data.drafts = []

    const { result } = renderHook(() => useAffectedVotes())

    expect(result.current.hasActive).toBe(true)
    expect(result.current.hasLive).toBe(true)
  })
})
