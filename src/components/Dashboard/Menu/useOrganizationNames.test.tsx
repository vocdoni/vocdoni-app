import { QueryClientProvider } from '@tanstack/react-query'
import { organizationQueryKeys } from '@vocdoni/react-providers'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { createAppQueryClient } from '~src/query-client'
import { useOrganizationNames } from './useOrganizationNames'

const get = vi.fn()

vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({ client: { organizations: { get } } }),
}))

describe('useOrganizationNames', () => {
  const render = (addresses: string[], queryClient = createAppQueryClient()) =>
    renderHook(() => useOrganizationNames(addresses), {
      wrapper: ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children),
    })

  beforeEach(() => vi.clearAllMocks())

  it('resolves each name and falls back to the address for one that fails', async () => {
    get.mockImplementation(async (address: string) => {
      if (address === '0xbad') throw new Error('boom')
      return { name: { default: `Name of ${address}` } }
    })

    const { result } = render(['0xone', '0xbad'])

    await waitFor(() => expect(result.current.data).toEqual({ '0xone': 'Name of 0xone', '0xbad': '0xbad' }))
  })

  it('reuses organizations already in the shared organization cache instead of fetching them again', async () => {
    const queryClient = createAppQueryClient()
    queryClient.setQueryData(organizationQueryKeys.organization('0xone'), { name: { default: 'Cached one' } })
    get.mockResolvedValue({ name: { default: 'Fetched two' } })

    const { result } = render(['0xone', '0xtwo'], queryClient)

    await waitFor(() => expect(result.current.data).toEqual({ '0xone': 'Cached one', '0xtwo': 'Fetched two' }))
    expect(get).toHaveBeenCalledTimes(1)
    expect(get).toHaveBeenCalledWith('0xtwo')
  })

  it('does not fetch with no addresses', () => {
    render([])

    expect(get).not.toHaveBeenCalled()
  })
})
