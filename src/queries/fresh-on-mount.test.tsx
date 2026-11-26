import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { createAppQueryClient } from '~src/query-client'
import { QueryKeys } from './keys'
import { useDraft } from '~components/Process/Create'
import { useDrafts } from '~src/elements/dashboard/processes/drafts'
import { useIntegratorInfo, useManagedOrganizations } from './integrators'
import { useImportJobProgress } from './members'
import { useProcessPrice } from './process-price'
import { useWallet } from './wallet'

const getWallet = vi.fn()
const getPrice = vi.fn()
const getElection = vi.fn()
const listElections = vi.fn()
const bearedFetch = vi.fn()

vi.mock('@vocdoni/react-components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vocdoni/react-components')>()),
  useOrganization: () => ({ organization: { address: '0xabc' } }),
}))
vi.mock('~src/app-env', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/app-env')>()),
  useAppEnv: () => ({ DISABLE_ANONYMOUS_VOTING: false }),
}))
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams()],
  useOutletContext: () => ({ jobId: 'job1' }),
}))

vi.mock('~components/Auth/useAuth', () => ({ useAuth: () => ({ currentAddress: '0xabc', bearedFetch }) }))
vi.mock('~src/providers/ApiClientProvider', () => ({
  useApiClient: () => ({
    client: { organizations: { getWallet }, elections: { getPrice, get: getElection, list: listElections } },
  }),
}))
vi.mock('./account', () => ({ useProfile: () => ({ data: undefined }) }))

// Reads that follow a payment, a webhook or a job must not be served from the 30 s default cache.
describe('queries that stay fresh on mount', () => {
  const processId = 'a'.repeat(24)

  it('re-reads the wallet balance although a cached copy is seconds old', async () => {
    const queryClient = createAppQueryClient()
    queryClient.setQueryData(QueryKeys.organization.wallet('0xabc', 1, 10), { balanceCents: 0, history: [] })
    getWallet.mockResolvedValue({ balanceCents: 5000, history: [] })

    const { result } = renderHook(() => useWallet(), {
      wrapper: ({ children }) => createElement(QueryClientProvider, { client: queryClient }, children),
    })

    await waitFor(() => expect(result.current.data?.balanceCents).toBe(5000))
    expect(getWallet).toHaveBeenCalledTimes(1)
  })

  it('re-reads the draft price although a cached copy is seconds old', async () => {
    const queryClient = createAppQueryClient()
    queryClient.setQueryData(QueryKeys.process.price(processId), { totalCents: 100, lines: [] })
    getPrice.mockResolvedValue({ totalCents: 900, lines: [] })

    const { result } = renderHook(() => useProcessPrice(processId), {
      wrapper: ({ children }) => createElement(QueryClientProvider, { client: queryClient }, children),
    })

    await waitFor(() => expect(result.current.price?.totalCents).toBe(900))
    expect(getPrice).toHaveBeenCalledTimes(1)
  })

  // Renders `hook` over a cache that already holds `queryKey`, and expects the one read to happen anyway.
  const expectRead = async (queryKey: unknown[], hook: () => unknown, request: ReturnType<typeof vi.fn>) => {
    const queryClient = createAppQueryClient()
    queryClient.setQueryData(queryKey, {})

    renderHook(hook, {
      wrapper: ({ children }) => createElement(QueryClientProvider, { client: queryClient }, children),
    })

    await waitFor(() => expect(request).toHaveBeenCalledTimes(1))
  }

  it('re-reads a draft the wizard resumes, which a payment may have published meanwhile', async () => {
    getElection.mockResolvedValue({ published: true })

    await expectRead(['draft', processId], () => useDraft(processId), getElection)
  })

  it('re-reads the drafts list, which the wizard changes without touching its cache', async () => {
    listElections.mockResolvedValue({ processes: [], pagination: {} })

    await expectRead([...QueryKeys.organization.drafts('0xabc'), 1, 10], () => useDrafts(), listElections)
  })

  it('re-reads the status of an import job', async () => {
    bearedFetch.mockResolvedValue({ status: 'completed' })

    await expectRead(
      QueryKeys.organization.membersImportProgress('0xabc', 'job1'),
      () => useImportJobProgress(),
      bearedFetch
    )
  })

  it('re-reads the integrator quota and the managed organizations spend', async () => {
    bearedFetch.mockResolvedValue({})

    await expectRead(QueryKeys.integrator.info(undefined), () => useIntegratorInfo(), bearedFetch)
    bearedFetch.mockClear()
    await expectRead(QueryKeys.integrator.managed(undefined, 1, 10), () => useManagedOrganizations(1, 10), bearedFetch)
  })
})
