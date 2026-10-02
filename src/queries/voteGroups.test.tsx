import { renderHook, waitFor } from '@testing-library/react'
import { mockUseOrganization } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AllProviders } from '~src/test-utils'
import {
  discardVoteGroupsOf,
  isVoteOwned,
  markVoteGroup,
  parseVoteGroupMarkers,
  copySourceName,
  sweepOrphanVoteGroups,
  type VoteGroupApi,
  type VoteGroupMarker,
  unmarkVoteGroup,
  useVoteGroupMarkers,
  voteGroupDescription,
  voteGroupMetaKey,
} from './voteGroups'

const fetch = vi.hoisted(() => vi.fn())

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: fetch }),
}))

describe('vote-owned group markers', () => {
  beforeEach(() => {
    fetch.mockReset()
    setReactProvidersMock({ useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }) })
  })

  it('reads one marker per vg_ key and ignores everything else', () => {
    const markers = parseVoteGroupMarkers({
      isDashboardTutorialClosed: true,
      // A name stored by an older build is dropped: the meta is public
      vg_g1: {
        processId: 'p1',
        kind: 'copy',
        createdAt: '2026-10-02T10:00:00Z',
        fromId: 'quota',
        from: 'Quota pagada',
      },
      vg_g2: { processId: 'p2', kind: 'snapshot', createdAt: '2026-10-02T11:00:00Z' },
      vg_bad: { processId: 'p3', kind: 'unknown' },
      vg_: { processId: 'p4', kind: 'copy' },
      vg_g5: 'nonsense',
    })

    expect([...markers.keys()]).toEqual(['g1', 'g2'])
    expect(markers.get('g1')).toEqual({
      processId: 'p1',
      kind: 'copy',
      createdAt: '2026-10-02T10:00:00Z',
      fromId: 'quota',
    })
    expect(isVoteOwned(markers, 'g2')).toBe(true)
    expect(isVoteOwned(markers, 'saved')).toBe(false)
    expect(isVoteOwned(markers, undefined)).toBe(false)
  })

  it('names what a copy came from only by looking it up', () => {
    const markers = new Map<string, VoteGroupMarker>([
      ['saved-copy', { processId: 'p1', kind: 'copy', createdAt: '', fromId: 'quota', source: 'saved' }],
      ['vote-copy', { processId: 'p2', kind: 'copy', createdAt: '', fromId: 'junta-own', source: 'previous' }],
      ['junta-own', { processId: 'junta', kind: 'copy', createdAt: '' }],
      ['gone-copy', { processId: 'p3', kind: 'copy', createdAt: '', fromId: 'deleted', source: 'saved' }],
    ])
    const context = {
      groupsById: new Map([['quota', { title: 'Quota pagada' }]]),
      markers,
      voteTitle: (id: string) => (id === 'junta' ? 'Junta 2025' : undefined),
    }

    expect(copySourceName(markers.get('saved-copy'), context)).toBe('Quota pagada')
    expect(copySourceName(markers.get('vote-copy'), context)).toBe('Junta 2025')
    expect(copySourceName(markers.get('gone-copy'), context)).toBeUndefined()
    expect(copySourceName(markers.get('vote-copy'), { ...context, voteTitle: undefined })).toBeUndefined()
  })

  it('marks a group by sending only its own key, which the API merges into the meta', async () => {
    fetch.mockResolvedValue(undefined)
    const marker = { processId: 'p1', kind: 'test' as const, createdAt: '2026-10-02T10:00:00Z' }

    await markVoteGroup(fetch, '0xorg', 'g1', marker)
    await unmarkVoteGroup(fetch, '0xorg', 'g1')

    expect(voteGroupMetaKey('g1')).toBe('vg_g1')
    expect(fetch).toHaveBeenNthCalledWith(1, 'organizations/0xorg/meta', {
      method: 'PUT',
      body: { meta: { vg_g1: marker } },
    })
    expect(fetch).toHaveBeenNthCalledWith(2, 'organizations/0xorg/meta', {
      method: 'DELETE',
      body: { keys: ['vg_g1'] },
    })
  })

  it('exposes the markers of the organization meta', async () => {
    fetch.mockResolvedValue({ meta: { vg_g1: { processId: 'p1', kind: 'snapshot', createdAt: '' } } })

    const { result } = renderHook(() => useVoteGroupMarkers(), { wrapper: AllProviders })

    await waitFor(() => expect(result.current.ready).toBe(true))
    await waitFor(() => expect(result.current.isVoteOwned('g1')).toBe(true))
    expect(result.current.markers.get('g1')?.processId).toBe('p1')
    expect(result.current.isVoteOwned('g2')).toBe(false)
  })

  it('describes the group in words', () => {
    const t = ((_key: string, options: { defaultValue: string; vote: string }) =>
      options.defaultValue.replace('{{vote}}', options.vote)) as never
    expect(voteGroupDescription(t, 'Assemblea 2026')).toBe(
      "Census of 'Assemblea 2026'. Changing it changes who can vote."
    )
  })
})

describe('cleaning up vote-owned groups', () => {
  const OLD = '2026-10-01T10:00:00.000Z'
  const NOW = Date.parse('2026-10-02T10:00:00.000Z')

  const fakeApi = (markers: Record<string, Partial<VoteGroupMarker>>) => {
    const api: VoteGroupApi = {
      readMemberIds: vi.fn(),
      readGroup: vi.fn(),
      createGroup: vi.fn(),
      deleteGroup: vi.fn(async () => undefined),
      mark: vi.fn(),
      unmark: vi.fn(async () => undefined),
      markers: vi.fn(
        async () =>
          new Map(
            Object.entries(markers).map(([id, marker]) => [
              id,
              { kind: 'copy', createdAt: OLD, ...marker } as VoteGroupMarker,
            ])
          )
      ),
    }
    return api
  }

  it('deletes a deleted draft’s groups and their markers, and nobody else’s', async () => {
    const api = fakeApi({ g1: { processId: 'draft' }, g2: { processId: 'other' }, g3: { processId: 'draft' } })

    expect(await discardVoteGroupsOf(api, 'draft')).toEqual(['g1', 'g3'])
    expect(api.deleteGroup).toHaveBeenCalledTimes(2)
    expect(api.deleteGroup).not.toHaveBeenCalledWith('g2')
    expect(api.unmark).toHaveBeenCalledWith('g1')
    expect(api.unmark).toHaveBeenCalledWith('g3')
  })

  it('keeps the marker of a group that could not be deleted, for the next sweep', async () => {
    const api = fakeApi({ g1: { processId: 'draft' } })
    api.deleteGroup = vi.fn(async () => {
      throw new Error('409')
    })

    expect(await discardVoteGroupsOf(api, 'draft')).toEqual([])
    expect(api.unmark).not.toHaveBeenCalled()
  })

  it('sweeps only marked groups nothing uses any more', async () => {
    const api = fakeApi({
      used: { processId: 'p1' },
      replaced: { processId: 'p1' },
      gone: { processId: 'deleted' },
      fresh: { processId: 'p1', createdAt: '2026-10-02T09:55:00.000Z' },
      unreadable: { processId: 'flaky' },
      draftWithoutGroup: { processId: 'p2' },
      publishedWithoutGroup: { processId: 'p3' },
    })
    const processes: Record<string, unknown> = {
      p1: { census: { groupId: 'used' } },
      deleted: null,
      p2: { published: false, census: {} },
      p3: { published: true, census: {} },
    }
    const readProcess = vi.fn(async (id: string) => {
      if (id === 'flaky') throw new Error('500')
      return processes[id] as never
    })

    const deleted = await sweepOrphanVoteGroups(api, readProcess, { now: NOW })

    expect(deleted.sort()).toEqual(['gone', 'publishedWithoutGroup', 'replaced'])
    // One read per vote
    expect(readProcess.mock.calls.filter(([id]) => id === 'p1')).toHaveLength(1)
  })
})
