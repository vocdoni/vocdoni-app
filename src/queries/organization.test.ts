import type { VocdoniApiClient } from '@vocdoni/api-client'
import { hashKey } from '@tanstack/react-query'
import { QueryKeys } from '~src/queries/keys'
import { paginatedElectionsQuery } from './organization'

const list = vi.fn()
const client = { elections: { list } } as unknown as VocdoniApiClient

describe('paginatedElectionsQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    list.mockResolvedValue({ processes: [], pagination: {} })
  })

  const run = async (params = {}) => {
    await paginatedElectionsQuery('0xorg', client, params).queryFn()
    return list.mock.calls[0][0]
  }

  it('asks for published elections only, so drafts stay in their own tab', async () => {
    expect(await run()).toMatchObject({ orgAddress: '0xorg', page: 1, published: true })
  })

  it('keeps asking for published elections when a status narrows the list', async () => {
    // The "Ended" tab still lists published elections, just a subset of them.
    expect(await run({ status: 'RESULTS' })).toMatchObject({ status: 'ENDED', published: true })
  })

  it('is disabled without an organization address', () => {
    expect(paginatedElectionsQuery(undefined, client, {}).enabled).toBe(false)
  })

  it('refuses to list without an organization address instead of asking the API for every process', async () => {
    // `enabled` only guards useQuery; ensureQueryData (the /admin/processes loaders) ignores it
    // and would otherwise send GET /processes with no orgAddress, which the SaaS rejects with
    // 400 "invalid URL parameter: missing orgAddress".
    await expect(paginatedElectionsQuery(undefined, client, {}).queryFn()).rejects.toThrow(/no organization address/i)
    expect(list).not.toHaveBeenCalled()
  })

  it('keeps the organization address in the cache key so addressless reads cannot share an entry', () => {
    // `.filter(Boolean)` used to drop an undefined address, collapsing this key onto a
    // different organization's — and onto the dashboard's own elections query.
    const withoutAddress = QueryKeys.organization.elections(undefined, {})
    const withAddress = QueryKeys.organization.elections('0xorg', {})

    expect(hashKey(withoutAddress)).not.toBe(hashKey(withAddress))
    expect(withoutAddress).toHaveLength(withAddress.length)
  })
})
