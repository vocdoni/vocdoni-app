import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ReactNode } from 'react'
import { QueryKeys } from './keys'
import {
  resultsStaleTime,
  useCanManageVotes,
  useDeleteDraft,
  useInvalidateVotes,
  useOrganizationVotes,
  useVotesResults,
} from './votes'

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

  it('stops on a next page that does not advance, and after 50 pages at most', async () => {
    client.elections.list.mockResolvedValueOnce(page(['a'], 2)).mockResolvedValueOnce(page(['b'], 2))
    const { result } = setup(useOrganizationVotes)
    await waitFor(() => expect(result.current.data?.map(({ id }) => id)).toEqual(['a', 'b']))
    expect(client.elections.list).toHaveBeenCalledTimes(2)

    client.elections.list.mockReset()
    let next = 1
    client.elections.list.mockImplementation(async () => page([`p${next}`], ++next))
    const endless = setup(useOrganizationVotes)
    await waitFor(() => expect(endless.result.current.data).toHaveLength(50))
    expect(client.elections.list).toHaveBeenCalledTimes(50)
  })

  it('stops paging once the query is cancelled', async () => {
    let answer: (value: unknown) => void = () => undefined
    client.elections.list.mockReturnValueOnce(new Promise((resolve) => (answer = resolve)))
    const { queryClient } = setup(useOrganizationVotes)
    await waitFor(() => expect(client.elections.list).toHaveBeenCalledTimes(1))

    await act(() => queryClient.cancelQueries({ queryKey: QueryKeys.organization.votes('0xorg') }))
    await act(async () => answer(page(['a'], 2)))

    expect(client.elections.list).toHaveBeenCalledTimes(1)
  })
})

describe('useVotesResults', () => {
  it('maps each process to its results, a 404 to null, and rethrows other failures', async () => {
    client.elections.getResults.mockImplementation(async (id: string) => {
      if (id === 'none') throw new VocdoniApiError(404, {}, 'not found')
      if (id === 'down') throw new VocdoniApiError(500, {}, 'down')
      return { id, questions: [{ questionId: 'q', finalResults: true }] }
    })
    const ids = ['a', 'none', 'down']
    const { result, queryClient } = setup(() => useVotesResults(ids))

    await waitFor(() =>
      expect(result.current.a).toEqual({ id: 'a', questions: [{ questionId: 'q', finalResults: true }] })
    )
    await waitFor(() => expect(result.current.none).toBeNull())
    await waitFor(() => expect(queryClient.getQueryState(QueryKeys.election.results('down'))?.status).toBe('error'))
    expect(result.current.down).toBeUndefined()
  })

  it('shares the vote page query and keeps a final tally without asking again', async () => {
    client.elections.getResults.mockResolvedValue({ id: 'a', questions: [{ questionId: 'q', finalResults: true }] })
    const first = setup(() => useVotesResults(['a']))
    await waitFor(() => expect(first.result.current.a).toBeTruthy())

    first.rerender()
    expect(client.elections.getResults).toHaveBeenCalledTimes(1)
    expect(first.queryClient.getQueryData(QueryKeys.election.results('a'))).toEqual(first.result.current.a)
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
    expect(invalidate).toHaveBeenCalledWith({ queryKey: QueryKeys.organization.votesAll })
  })

  it('stays quiet when asked to', async () => {
    client.elections.delete.mockResolvedValue(undefined)
    const { result } = setup(useDeleteDraft)
    await act(() => result.current.mutateAsync({ draftId: 'd1', silent: true }))
    expect(toast).not.toHaveBeenCalled()
  })

  it('keeps the stored draft when the delete fails, and says it failed in its own words', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    client.elections.delete.mockRejectedValue(new Error('raw backend text'))
    const { result } = setup(useDeleteDraft)
    await act(() => result.current.mutateAsync({ draftId: 'd1' }).catch(() => undefined))
    expect(clearStoredDraftId).not.toHaveBeenCalled()
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', title: 'The draft could not be deleted' })
    )
    expect(JSON.stringify(toast.mock.calls)).not.toContain('raw backend text')
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
