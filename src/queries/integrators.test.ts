import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { createElement, ReactNode } from 'react'
import { useUpdateManagedOrganization } from './integrators'

const mockClient = vi.hoisted(() => ({
  organizations: { updateManaged: vi.fn() },
}))

vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({ client: mockClient }),
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

  it('sets only the spend cap of the managed organization, prefixing the address with 0x', async () => {
    mockClient.organizations.updateManaged.mockResolvedValue({ address: '0xabc', spendCapCents: 2500 })

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await result.current.mutateAsync({ address: 'abc', spendCapCents: 2500 })

    expect(mockClient.organizations.updateManaged).toHaveBeenCalledWith('0xabc', { spendCapCents: 2500 })
  })

  it('sends null to lift the cap', async () => {
    mockClient.organizations.updateManaged.mockResolvedValue({ address: '0xabc', spendCapCents: null })

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await result.current.mutateAsync({ address: '0xabc', spendCapCents: null })

    expect(mockClient.organizations.updateManaged).toHaveBeenCalledWith('0xabc', { spendCapCents: null })
  })

  it('invalidates the managed organizations once the cap is saved', async () => {
    mockClient.organizations.updateManaged.mockResolvedValue({ address: '0xabc', spendCapCents: 0 })
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await result.current.mutateAsync({ address: '0xabc', spendCapCents: 0 })

    await waitFor(() => expect(invalidate).toHaveBeenCalledWith({ queryKey: ['integrator', 'managed'] }))
  })

  it('keeps the managed organizations cache when the save fails', async () => {
    mockClient.organizations.updateManaged.mockRejectedValue(
      new VocdoniApiError(403, { error: 'Forbidden' }, 'Forbidden')
    )
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useUpdateManagedOrganization(), { wrapper })
    await expect(result.current.mutateAsync({ address: '0xabc', spendCapCents: 100 })).rejects.toThrow('Forbidden')

    expect(invalidate).not.toHaveBeenCalled()
  })
})
