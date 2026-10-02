import { VocdoniApiError } from '@vocdoni/api-client'
import type { VoteGroupApi, VoteGroupMarker } from '~src/queries/voteGroups'
import { attachCensus, EmptyCensusError } from './attach'
import { freezeEveryone, planPublishCensus, preparePublishCensus } from './freeze'
import { StaleDraftError, writeWithLatest } from './voteGroup'

const NOW = () => new Date('2026-10-02T10:00:00Z')

/** A fake of the group and meta calls that records what was called, in order. */
const fakeApi = (members: Record<string, string[]> = {}) => {
  const calls: string[] = []
  let next = 0
  const api: VoteGroupApi & { calls: string[] } = {
    calls,
    readMemberIds: vi.fn(async (groupId: string) => {
      calls.push(`read ${groupId}`)
      return members[groupId] ?? []
    }),
    readGroup: vi.fn(async (groupId: string) => ({ memberIds: members[groupId] })),
    createGroup: vi.fn(async () => {
      next += 1
      calls.push(`create new${next}`)
      return `new${next}`
    }),
    deleteGroup: vi.fn(async (groupId: string) => {
      calls.push(`delete ${groupId}`)
    }),
    mark: vi.fn(async (groupId: string) => {
      calls.push(`mark ${groupId}`)
    }),
    unmark: vi.fn(async (groupId: string) => {
      calls.push(`unmark ${groupId}`)
    }),
    markers: vi.fn(async () => new Map()),
  }
  return api
}

const stale = () => new VocdoniApiError(409, { code: 40171 }, 'stale', 40171)

describe('copy-on-attach', () => {
  it('copies the source group’s people into a group of the vote’s own, marked as its copy', async () => {
    const api = fakeApi({ saved: ['m1', 'm2', 'm2', 'm3'] })
    const repoint = vi.fn(async (groupId: string) => {
      api.calls.push(`repoint ${groupId}`)
    })

    const result = await attachCensus(api, {
      processId: 'p1',
      source: { kind: 'saved', groupId: 'saved', name: 'Quota pagada' },
      title: 'Assemblea — census',
      description: "Census of 'Assemblea'",
      repoint,
      now: NOW,
    })

    expect(result).toEqual({ groupId: 'new1', count: 3 })
    expect(api.createGroup).toHaveBeenCalledWith({
      title: 'Assemblea — census',
      description: "Census of 'Assemblea'",
      memberIds: ['m1', 'm2', 'm3'],
    })
    expect(api.mark).toHaveBeenCalledWith('new1', {
      processId: 'p1',
      kind: 'copy',
      from: 'Quota pagada',
      source: 'saved',
      createdAt: '2026-10-02T10:00:00.000Z',
    })
    expect(api.calls).toEqual(['read saved', 'create new1', 'mark new1', 'repoint new1'])
    // The saved census is only read, never touched
    expect(api.deleteGroup).not.toHaveBeenCalled()
  })

  it('takes picked people as they are, with no name to copy from', async () => {
    const api = fakeApi()
    await attachCensus(api, {
      processId: 'p1',
      source: { kind: 'choose', memberIds: ['a', 'b'] },
      title: 't',
      description: 'd',
      repoint: async () => undefined,
      now: NOW,
    })

    expect(api.readMemberIds).not.toHaveBeenCalled()
    expect(api.mark).toHaveBeenCalledWith('new1', expect.not.objectContaining({ from: expect.anything() }))
  })

  it('refuses to create a census of nobody', async () => {
    const api = fakeApi()
    await expect(
      attachCensus(api, {
        processId: 'p1',
        source: { kind: 'saved', groupId: 'empty', name: 'Empty' },
        title: 't',
        description: 'd',
        repoint: async () => undefined,
      })
    ).rejects.toBeInstanceOf(EmptyCensusError)
    expect(api.createGroup).not.toHaveBeenCalled()
  })

  it('replaces the previous own census after repointing', async () => {
    const api = fakeApi({ 'other-vote': ['m1'] })
    const repoint = vi.fn(async (groupId: string) => {
      api.calls.push(`repoint ${groupId}`)
    })

    await attachCensus(api, {
      processId: 'p1',
      source: { kind: 'previous', groupId: 'other-vote', name: 'Assemblea 2025' },
      title: 't',
      description: 'd',
      repoint,
      replacing: 'old',
      now: NOW,
    })

    expect(api.calls).toEqual([
      'read other-vote',
      'create new1',
      'mark new1',
      'repoint new1',
      'delete old',
      'unmark old',
    ])
  })

  it('deletes nothing it replaces when the draft could not be repointed', async () => {
    const api = fakeApi({ saved: ['m1'] })
    const failure = new VocdoniApiError(400, {}, 'bad request')

    await expect(
      attachCensus(api, {
        processId: 'p1',
        source: { kind: 'saved', groupId: 'saved', name: 'S' },
        title: 't',
        description: 'd',
        repoint: async () => {
          throw failure
        },
        replacing: 'old',
      })
    ).rejects.toBe(failure)

    // The refused copy goes; the census the draft still uses stays
    expect(api.calls).toEqual(['read saved', 'create new1', 'mark new1', 'delete new1', 'unmark new1'])
  })

  it('leaves the new group to the sweep when the repoint may have landed (network, 5xx)', async () => {
    const api = fakeApi({ saved: ['m1'] })

    await expect(
      attachCensus(api, {
        processId: 'p1',
        source: { kind: 'saved', groupId: 'saved', name: 'S' },
        title: 't',
        description: 'd',
        repoint: async () => {
          throw new TypeError('Failed to fetch')
        },
        replacing: 'old',
      })
    ).rejects.toThrow('Failed to fetch')

    expect(api.deleteGroup).not.toHaveBeenCalled()
    expect(api.unmark).not.toHaveBeenCalled()
  })

  it('deletes the group at once when it could not be marked, and never repoints', async () => {
    const api = fakeApi({ saved: ['m1'] })
    api.mark = vi.fn(async () => {
      throw new Error('meta down')
    })
    const repoint = vi.fn()

    await expect(
      attachCensus(api, {
        processId: 'p1',
        source: { kind: 'saved', groupId: 'saved', name: 'S' },
        title: 't',
        description: 'd',
        repoint,
      })
    ).rejects.toThrow('meta down')

    expect(repoint).not.toHaveBeenCalled()
    expect(api.deleteGroup).toHaveBeenCalledWith('new1')
  })
})

describe('freeze at publish', () => {
  const markers = new Map<string, VoteGroupMarker>([
    ['snap-p1', { processId: 'p1', kind: 'snapshot', createdAt: '' }],
    ['copy-p1', { processId: 'p1', kind: 'copy', createdAt: '' }],
    ['copy-p2', { processId: 'p2', kind: 'copy', createdAt: '' }],
  ])

  it('freezes only a census that follows Everyone (or an earlier snapshot of it)', () => {
    const plan = (groupId?: string) =>
      planPublishCensus({ processId: 'p1', groupId, everyoneId: 'all', markers, groupTitle: 'Board' })

    expect(plan('all')).toEqual({ kind: 'freeze' })
    expect(plan('snap-p1')).toEqual({ kind: 'freeze', replacing: 'snap-p1' })
    expect(plan('copy-p1')).toEqual({ kind: 'keep' })
    expect(plan(undefined)).toEqual({ kind: 'keep' })
    // Someone else's census, or a saved one: this vote gets its own copy
    expect(plan('copy-p2')).toEqual({ kind: 'copy', groupId: 'copy-p2', name: 'Board' })
    expect(plan('saved')).toEqual({ kind: 'copy', groupId: 'saved', name: 'Board' })
  })

  it('snapshots every member, marks it and points the draft at it', async () => {
    const api = fakeApi()
    const repoint = vi.fn(async (groupId: string) => {
      api.calls.push(`repoint ${groupId}`)
    })

    const groupId = await freezeEveryone(api, { processId: 'p1', title: 't', description: 'd', repoint, now: NOW })

    expect(groupId).toBe('new1')
    expect(api.createGroup).toHaveBeenCalledWith({ title: 't', description: 'd', includeAllMembers: true })
    expect(api.mark).toHaveBeenCalledWith('new1', {
      processId: 'p1',
      kind: 'snapshot',
      createdAt: '2026-10-02T10:00:00.000Z',
    })
    expect(api.calls).toEqual(['create new1', 'mark new1', 'repoint new1'])
  })

  it('on a retry, replaces the previous snapshot after repointing', async () => {
    const api = fakeApi()
    const repoint = vi.fn(async (groupId: string) => {
      api.calls.push(`repoint ${groupId}`)
    })

    await preparePublishCensus(
      api,
      { kind: 'freeze', replacing: 'snap-p1' },
      {
        processId: 'p1',
        title: 't',
        description: 'd',
        repoint,
      }
    )

    expect(api.calls).toEqual(['create new1', 'mark new1', 'repoint new1', 'delete snap-p1', 'unmark snap-p1'])
  })

  it('keeps the draft frozen when publishing fails afterwards: nothing is undone', async () => {
    // The freeze resolves before publishing; a failed publish is outside it and deletes nothing
    const api = fakeApi()
    await freezeEveryone(api, { processId: 'p1', title: 't', description: 'd', repoint: async () => undefined })
    expect(api.deleteGroup).not.toHaveBeenCalled()
  })

  it('copies a census the vote does not own instead of sharing it', async () => {
    const api = fakeApi({ saved: ['m1', 'm2'] })
    const groupId = await preparePublishCensus(
      api,
      { kind: 'copy', groupId: 'saved', name: 'Board' },
      {
        processId: 'p1',
        title: 't',
        description: 'd',
        repoint: async () => undefined,
      }
    )

    expect(groupId).toBe('new1')
    expect(api.createGroup).toHaveBeenCalledWith(expect.objectContaining({ memberIds: ['m1', 'm2'] }))
    expect(api.deleteGroup).not.toHaveBeenCalled()
  })

  it('leaves a census of its own as it is', async () => {
    const api = fakeApi()
    expect(
      await preparePublishCensus(
        api,
        { kind: 'keep' },
        {
          processId: 'p1',
          title: 't',
          description: 'd',
          repoint: vi.fn(),
        }
      )
    ).toBeNull()
    expect(api.createGroup).not.toHaveBeenCalled()
  })
})

describe('writing with the latest updatedAt', () => {
  it('never retries a stale write: it would overwrite the newer draft', async () => {
    const read = vi.fn().mockResolvedValue('t1')
    const write = vi.fn().mockRejectedValue(stale())

    await expect(writeWithLatest(read, write)).rejects.toBeInstanceOf(StaleDraftError)

    expect(read).toHaveBeenCalledTimes(1)
    expect(write).toHaveBeenCalledTimes(1)
    expect(write).toHaveBeenCalledWith('t1')
  })

  it('gives up when it is stale, and the snapshot it made is deleted', async () => {
    const api = fakeApi()
    const write = vi.fn().mockRejectedValue(stale())

    await expect(
      freezeEveryone(api, {
        processId: 'p1',
        title: 't',
        description: 'd',
        repoint: () => writeWithLatest(async () => 't', write),
      })
    ).rejects.toBeInstanceOf(StaleDraftError)

    expect(write).toHaveBeenCalledTimes(1)
    expect(api.calls).toEqual(['create new1', 'mark new1', 'delete new1', 'unmark new1'])
  })

  it('does not retry other failures', async () => {
    const write = vi.fn().mockRejectedValue(new Error('boom'))
    await expect(writeWithLatest(async () => 't', write)).rejects.toThrow('boom')
    expect(write).toHaveBeenCalledTimes(1)
  })
})
