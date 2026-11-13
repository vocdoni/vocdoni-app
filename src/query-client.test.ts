import { UnauthorizedApiError } from '~components/Auth/api'
import { createAppQueryClient } from './query-client'

describe('createAppQueryClient', () => {
  it('serves revisited screens from cache for 30 seconds without refocus refetches', () => {
    const options = createAppQueryClient().getDefaultOptions().queries

    expect(options?.staleTime).toBe(30_000)
    expect(options?.refetchOnWindowFocus).toBe(false)
  })

  it('does not retry an unauthorized call but retries other failures up to three times', () => {
    const retry = createAppQueryClient().getDefaultOptions().queries?.retry as (n: number, e: unknown) => boolean

    expect(retry(0, new UnauthorizedApiError({ error: 'nope' }))).toBe(false)
    expect(retry(2, new Error('boom'))).toBe(true)
    expect(retry(3, new Error('boom'))).toBe(false)
  })
})
