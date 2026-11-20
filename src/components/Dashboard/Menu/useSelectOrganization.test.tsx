import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { organizationQueryKeys } from '@vocdoni/react-providers'
import type { ReactNode } from 'react'
import { Routes } from '~routes'
import { QueryKeys } from '~src/queries/keys'
import type { Organization } from '~src/queries/account'
import { useSelectOrganization } from './useSelectOrganization'

const navigate = vi.fn()
const refreshAddresses = vi.fn(async () => undefined)

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: () => navigate,
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ refreshAddresses }),
}))

const previous = '0xprevious'
const next = { address: '0xnext' } as Organization

const userLevelKeys = [
  QueryKeys.profile,
  ['auth', 'addresses', 'bearer-token'],
  QueryKeys.organization.roles,
  QueryKeys.organization.types,
  QueryKeys.organization.languages,
]

const organizationKeys = [
  organizationQueryKeys.organization(previous),
  QueryKeys.organization.elections(previous),
  QueryKeys.organization.members(previous),
  QueryKeys.organization.wallet(previous, 1, 10),
  QueryKeys.organization.users(previous),
  QueryKeys.integrator.info(previous),
  QueryKeys.process.price('0xprocess'),
  ['draft', 'draft-1'],
  // Anything not on the allowlist goes, including keys nobody registered yet.
  ['some', 'future', 'key'],
]

const setup = () => {
  const queryClient = new QueryClient()
  for (const key of [...userLevelKeys, ...organizationKeys]) {
    queryClient.setQueryData(key, { cached: true })
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  const { result } = renderHook(() => useSelectOrganization(), { wrapper })

  return { queryClient, select: result.current }
}

describe('useSelectOrganization', () => {
  beforeEach(() => {
    localStorage.clear()
    navigate.mockReset()
    refreshAddresses.mockClear()
  })

  it('drops organization data but keeps user-level queries, so the switch does not replay the boot', async () => {
    const { queryClient, select } = setup()

    await act(() => select(next))

    // Listing the offending keys makes a failure name them.
    expect(organizationKeys.filter((key) => queryClient.getQueryData(key) !== undefined)).toEqual([])
    expect(userLevelKeys.filter((key) => queryClient.getQueryData(key) === undefined)).toEqual([])
  })

  it('selects the organization, re-resolves the address and lands on the right private root', async () => {
    const { select } = setup()

    await act(() => select(next))
    expect(localStorage.getItem('signerAddress')).toBe(next.address)
    expect(refreshAddresses).toHaveBeenCalledTimes(1)
    expect(navigate).toHaveBeenLastCalledWith(Routes.dashboard.base, { replace: true })

    await act(() => select(next, true))
    expect(navigate).toHaveBeenLastCalledWith(Routes.integrators.base, { replace: true })
  })
})
