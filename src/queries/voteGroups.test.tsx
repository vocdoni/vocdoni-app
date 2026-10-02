import { renderHook, waitFor } from '@testing-library/react'
import { mockUseOrganization } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AllProviders } from '~src/test-utils'
import {
  isVoteOwned,
  markVoteGroup,
  parseVoteGroupMarkers,
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
      vg_g1: { processId: 'p1', kind: 'copy', createdAt: '2026-10-02T10:00:00Z', from: 'Quota pagada' },
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
      from: 'Quota pagada',
    })
    expect(isVoteOwned(markers, 'g2')).toBe(true)
    expect(isVoteOwned(markers, 'saved')).toBe(false)
    expect(isVoteOwned(markers, undefined)).toBe(false)
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
