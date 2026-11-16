import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { QueryKeys } from './keys'
import { resultsStaleTime, useCanManageVotes, useDeleteDraft, useInvalidateVotes, useOrganizationVotes } from './votes'

const client = { elections: { list: vi.fn(), delete: vi.fn(), getResults: vi.fn() } }
const toast = vi.fn()
const clearStoredDraftId = vi.fn()
let profile: unknown

vi.mock('~src/providers/ApiClientProvider', () => ({ useApiClient: () => ({ client }) }))
vi.mock('~components/Toast', () => ({ useToast: () => toast }))
vi.mock('~components/Process/Create/draft-storage', () => ({
  clearStoredDraftId: (...args: unknown[]) => clearStoredDraftId(...args),
}))
vi.mock('~components/Auth/useAuth', () => ({ useAuth: () => ({ currentAddress: '0xorg' }) }))
vi.mock('./account', () => ({ useProfile: () => ({ data: profile }) }))
vi.mock('@vocdoni/react-components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vocdoni/react-components')>()),
  useOrganization: () => ({ organization: { address: '0xorg' } }),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, options?: { defaultValue?: string }) => options?.defaultValue ?? key }),
}))

const page = (ids: string[], nextPage: number | null) => ({
  processes: ids.map((id) => ({ id, questions: [] })),
  pagination: { totalItems: 0, currentPage: 1, lastPage: 2, previousPage: null, nextPage },
})

const setup = <T,>(hook: () => T) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, ...renderHook(hook, { wrapper }) }
}

beforeEach(() => vi.clearAllMocks())

describe('useOrganizationVotes', () => {
  it('follows every page, drafts included, 100 at a time', async () => {
    client.elections.list.mockResolvedValueOnce(page(['a', 'b'], 2)).mockResolvedValueOnce(page(['c'], null))
    const { result } = setup(useOrganizationVotes)

    await waitFor(() => expect(result.current.data?.map(({ id }) => id)).toEqual(['a', 'b', 'c']))
    expect(client.elections.list).toHaveBeenNthCalledWith(1, { orgAddress: '0xorg', page: 1, limit: 100 })
    expect(client.elections.list).toHaveBeenNthCalledWith(2, { orgAddress: '0xorg', page: 2, limit: 100 })
  })

  it('seeds the vote page query without overwriting a full read', async () => {
    client.elections.list.mockResolvedValue(page(['a', 'b'], null))
    const { result, queryClient } = setup(useOrganizationVotes)
    const fullRead = { id: 'a', questions: [], results: 'kept' }
    queryClient.setQueryData(QueryKeys.election.process('a'), fullRead)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(queryClient.getQueryData(QueryKeys.election.process('a'))).toBe(fullRead)
    expect(queryClient.getQueryData(QueryKeys.election.process('b'))).toEqual({ id: 'b', questions: [] })
  })
})

describe('useInvalidateVotes', () => {
  it('marks the list of every organization stale', async () => {
    const { result, queryClient } = setup(useInvalidateVotes)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await act(() => result.current())

    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votesAll })
  })
})

describe('resultsStaleTime', () => {
  it('keeps final tallies fresh for good and live ones for 30 seconds', () => {
    expect(resultsStaleTime({ id: 'p', questions: [{ questionId: 'q', finalResults: true }] })).toBe(Infinity)
    expect(resultsStaleTime({ id: 'p', questions: [{ questionId: 'q', finalResults: false }] })).toBe(30_000)
    expect(resultsStaleTime(null)).toBe(30_000)
  })
})

describe('useDeleteDraft', () => {
  it('deletes, forgets the stored draft, toasts and refreshes the votes list', async () => {
    client.elections.delete.mockResolvedValue(undefined)
    const { result, queryClient } = setup(useDeleteDraft)
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    await act(() => result.current.mutateAsync({ draftId: 'd1' }))

    expect(clearStoredDraftId).toHaveBeenCalledWith('0xorg', 'd1')
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votes('0xorg') })
  })

  it('stays quiet when asked to', async () => {
    client.elections.delete.mockResolvedValue(undefined)
    const { result } = setup(useDeleteDraft)
    await act(() => result.current.mutateAsync({ draftId: 'd1', silent: true }))
    expect(toast).not.toHaveBeenCalled()
  })

  it('keeps the stored draft when the delete fails', async () => {
    client.elections.delete.mockRejectedValue(new Error('nope'))
    const { result } = setup(useDeleteDraft)
    await act(() => result.current.mutateAsync({ draftId: 'd1' }).catch(() => undefined))
    expect(clearStoredDraftId).not.toHaveBeenCalled()
    expect(toast).not.toHaveBeenCalled()
  })
})

describe('useCanManageVotes', () => {
  it.each([
    ['admin', true],
    ['Manager', true],
    ['viewer', false],
  ])('a %s may manage: %s', (role, expected) => {
    profile = { organizations: [{ organization: { address: '0xorg' }, role }] }
    expect(setup(useCanManageVotes).result.current).toBe(expected)
  })

  it('is false until the profile loads', () => {
    profile = undefined
    expect(setup(useCanManageVotes).result.current).toBe(false)
  })
})
