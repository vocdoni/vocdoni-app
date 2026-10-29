import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, ReactNode } from 'react'
import { useUpdateManagedOrganization } from './integrators'

const mockBearedFetch = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch: mockBearedFetch }),
}))

describe('useUpdateManagedOrganization', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  })

  afterEach(() => {
    queryClient.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)

  it('PUTs only the spend cap to the managed organization, prefixing the address with 0x', async () => {
    mockBearedFetch.mockResolvedValue({ address: '0xabc', spendCapCents: 2500 })

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await result.current.mutateAsync({ address: 'abc', spendCapCents: 2500 })

    expect(mockBearedFetch).toHaveBeenCalledWith('integrator/organizations/0xabc', {
      method: 'PUT',
      body: { spendCapCents: 2500 },
    })
  })

  it('sends null to lift the cap', async () => {
    mockBearedFetch.mockResolvedValue({ address: '0xabc', spendCapCents: null })

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await result.current.mutateAsync({ address: '0xabc', spendCapCents: null })

    expect(mockBearedFetch).toHaveBeenCalledWith('integrator/organizations/0xabc', {
      method: 'PUT',
      body: { spendCapCents: null },
    })
  })

  it('invalidates the managed organizations once the cap is saved', async () => {
    mockBearedFetch.mockResolvedValue({ address: '0xabc', spendCapCents: 0 })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await result.current.mutateAsync({ address: '0xabc', spendCapCents: 0 })

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['integrator', 'managed'] }))
  })

  it('keeps the managed organizations cache when the save fails', async () => {
    mockBearedFetch.mockRejectedValue(new Error('Forbidden'))
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await expect(result.current.mutateAsync({ address: '0xabc', spendCapCents: 100 })).rejects.toThrow('Forbidden')

    expect(invalidate).not.toHaveBeenCalled()
  })
})
