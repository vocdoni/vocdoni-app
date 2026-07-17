import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { QueryKeys } from './keys'
import { useAddMembers, useDeleteMembers, useEditMember } from './members'
import { useOrganizationMeta } from './organization'

// Define mock functions before vi.mock (Vitest hoists vi.mock but not the variables)
const mockBearedFetch = vi.fn()
const mockSetStepDone = vi.fn()
// Mutable so individual tests can exercise hex/non-hex addresses (Bug B)
let mockOrganizationAddress = '0x123'

// Mock the auth hook
vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: mockBearedFetch,
  }),
}))

// Keep enforceHexPrefix (and everything else) real, only stub useOrganization
vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  return {
    ...actual,
    useOrganization: () => ({ organization: { address: mockOrganizationAddress } }),
  }
})

// Keep the real module (SetupStepIds, useOrganizationMeta) but stub the setup hook
// so useAddMembers doesn't drag in the whole meta query machinery.
vi.mock('./organization', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./organization')>()
  return {
    ...actual,
    useOrganizationSetup: () => ({ setStepDone: mockSetStepDone }),
  }
})

describe('members mutations cache invalidation', () => {
  let queryClient: QueryClient
  let invalidateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockOrganizationAddress = '0x123'
    mockBearedFetch.mockResolvedValue(undefined)

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false, retryDelay: 0 },
        mutations: { retry: false },
      },
    })
    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  })

  afterEach(() => {
    queryClient.clear()
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('invalidates the members list after editing a member', async () => {
    const { result } = renderHook(() => useEditMember(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ id: '1', name: 'Edited' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.members('0x123') })
  })

  it('invalidates the members list after deleting members', async () => {
    const { result } = renderHook(() => useDeleteMembers(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ ids: ['1', '2'] })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.members('0x123') })
  })

  it('invalidates the members list and completes the setup step after adding members', async () => {
    mockBearedFetch.mockResolvedValue({ count: 1 })
    const { result } = renderHook(() => useAddMembers(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ member: {} })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockSetStepDone).toHaveBeenCalledWith('memberbaseUpload')
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.members('0x123') })
  })
})

describe('organization meta mutations cache invalidation (Bug B)', () => {
  let queryClient: QueryClient
  let invalidateSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    // A raw address without the 0x prefix is where the query key and the
    // enforceHexPrefix'd key diverge — this is the regression scenario.
    mockOrganizationAddress = 'abc123'
    mockBearedFetch.mockResolvedValue({ meta: {} })

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { gcTime: Infinity, retry: false, retryDelay: 0 },
        mutations: { retry: false },
      },
    })
    invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
  })

  afterEach(() => {
    queryClient.clear()
  })

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  it('deleteMeta invalidates the same key the meta query uses', async () => {
    const { result } = renderHook(() => useOrganizationMeta(), { wrapper })

    await act(async () => {
      await result.current.deleteMetaAsync(['isDashboardTutorialClosed'])
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.meta('abc123') })
  })

  it('updateMeta invalidates the same key the meta query uses', async () => {
    const { result } = renderHook(() => useOrganizationMeta(), { wrapper })

    await act(async () => {
      await result.current.updateMetaAsync({ isDashboardTutorialClosed: true })
    })

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.meta('abc123') })
  })
})
