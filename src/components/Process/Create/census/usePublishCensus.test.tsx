import { act, renderHook } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { AllProviders, mockUseOrganization } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { defaultProcessValues, defaultQuestion, type Process } from '../common'
import { usePublishCensus } from './usePublishCensus'
import { StaleDraftError } from './voteGroup'

const data = vi.hoisted(() => ({
  markers: new Map<string, unknown>(),
  updatedAt: ['t1'],
  update: vi.fn(),
  get: vi.fn(),
}))

const api = vi.hoisted(() => ({
  readMemberIds: vi.fn(async () => ['m1']),
  readGroup: vi.fn(),
  createGroup: vi.fn(async () => 'snap-new'),
  deleteGroup: vi.fn(async () => undefined),
  mark: vi.fn(async () => undefined),
  unmark: vi.fn(async () => undefined),
  markers: vi.fn(async () => data.markers),
}))

vi.mock('~components/Auth/Subscription', () => ({ useSubscription: () => ({ permission: () => true }) }))
vi.mock('~components/Auth/useAuth', () => ({ useAuth: () => ({ bearedFetch: vi.fn() }) }))
vi.mock('~src/queries/groups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/groups')>()),
  useAllGroups: () => ({
    data: [
      { id: 'all', title: 'All', isAutoGroup: true, membersCount: 120 },
      { id: 'board', title: 'Board', membersCount: 7 },
    ],
  }),
}))
vi.mock('~src/queries/voteGroups', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/queries/voteGroups')>()),
  useVoteGroupApi: () => api,
}))
vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: { elections: { get: data.get, update: data.update } } }),
}))

const form: Process = {
  ...defaultProcessValues,
  title: 'Assemblea',
  questions: [{ ...defaultQuestion, title: 'Q', options: [{ option: 'Yes' }, { option: 'No' }] }],
  endDate: '2099-01-01',
  endTime: '10:00',
  groupId: 'all',
  census: { credentials: ['memberNumber'], use2FA: true, use2FAMethod: 'email' },
}

const exclusive = vi.fn()
const runExclusive = <T,>(write: () => Promise<T>): Promise<T> => {
  exclusive()
  return write()
}

const prepare = async (values: Process) => {
  const { result } = renderHook(() => usePublishCensus(runExclusive), { wrapper: AllProviders })
  let outcome: unknown
  await act(async () => {
    outcome = await result.current('draft-1', values).catch((error) => error)
  })
  return outcome
}

describe('usePublishCensus', () => {
  beforeEach(() => {
    setReactProvidersMock({ useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }) })
    data.markers = new Map()
    data.update.mockReset().mockResolvedValue(undefined)
    let reads = 0
    data.get.mockReset().mockImplementation(async () => ({ updatedAt: `t${++reads}` }))
    Object.values(api).forEach((fn) => fn.mockClear())
    exclusive.mockClear()
  })

  it('freezes Everyone: repoints the draft at the snapshot with the same sign-in and its latest updatedAt', async () => {
    expect(await prepare(form)).toBe('snap-new')

    expect(api.createGroup).toHaveBeenCalledWith(expect.objectContaining({ includeAllMembers: true }))
    expect(api.mark).toHaveBeenCalledWith(
      'snap-new',
      expect.objectContaining({ processId: 'draft-1', kind: 'snapshot' })
    )
    expect(exclusive).toHaveBeenCalledTimes(1)
    expect(data.update).toHaveBeenCalledTimes(1)
    const [processId, body] = data.update.mock.calls[0]
    expect(processId).toBe('draft-1')
    expect(body.updatedAt).toBe('t1')
    expect(body.census).toMatchObject({ groupId: 'snap-new', authFields: ['memberNumber'], twoFaFields: ['email'] })
    expect(body.questions).toHaveLength(1)
  })

  it('reads the draft again and retries once when the write was stale', async () => {
    data.update.mockRejectedValueOnce(new VocdoniApiError(409, {}, 'stale', 40171))

    expect(await prepare(form)).toBe('snap-new')
    expect(data.update).toHaveBeenCalledTimes(2)
    expect(data.update.mock.calls[1][1].updatedAt).toBe('t2')
  })

  it('aborts when it stays stale, and deletes the snapshot it made', async () => {
    data.update.mockRejectedValue(new VocdoniApiError(409, {}, 'stale', 40171))

    expect(await prepare(form)).toBeInstanceOf(StaleDraftError)
    expect(api.deleteGroup).toHaveBeenCalledWith('snap-new')
  })

  it('freezes afresh after a failed publish, replacing the earlier snapshot', async () => {
    data.markers = new Map([['snap-old', { processId: 'draft-1', kind: 'snapshot', createdAt: '' }]])

    expect(await prepare({ ...form, groupId: 'snap-old' })).toBe('snap-new')
    expect(api.deleteGroup).toHaveBeenCalledWith('snap-old')
    expect(api.unmark).toHaveBeenCalledWith('snap-old')
  })

  it('leaves a census the vote owns as it is', async () => {
    data.markers = new Map([['own', { processId: 'draft-1', kind: 'copy', createdAt: '' }]])

    expect(await prepare({ ...form, groupId: 'own' })).toBeNull()
    expect(api.createGroup).not.toHaveBeenCalled()
    expect(data.update).not.toHaveBeenCalled()
  })

  it('never freezes without a sign-in, which would leave the group out of the census', async () => {
    expect(await prepare({ ...form, census: null })).toBeInstanceOf(Error)
    expect(api.createGroup).not.toHaveBeenCalled()
  })
})
