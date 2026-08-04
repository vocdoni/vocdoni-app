import type { VocdoniApiClient } from '@vocdoni/api-client'
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
})
