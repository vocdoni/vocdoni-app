import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router'
import { mockUseOrganization } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { VocdoniApiError } from '@vocdoni/api-client'
import { computeReadiness, useMembersCount, usePaginatedMembers, useSignInReadiness } from './members'

const bearedFetch = vi.fn()

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ bearedFetch }),
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    <MemoryRouter initialEntries={['/admin/memberbase/members/1']}>{children}</MemoryRouter>
  </QueryClientProvider>
)

describe('member queries', () => {
  beforeEach(() => {
    bearedFetch.mockReset()
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
  })

  afterEach(() => {
    resetReactProvidersMock()
  })

  it('counts the memberbase with a one-row request', async () => {
    bearedFetch.mockResolvedValue({ members: [{}], pagination: { totalItems: 1742 } })
    const { result } = renderHook(() => useMembersCount(), { wrapper })

    await waitFor(() => expect(result.current.known).toBe(true))
    expect(result.current.count).toBe(1742)
    expect(bearedFetch).toHaveBeenCalledWith('organizations/0xorg/members?page=1&limit=1')
  })

  it('encodes the search term', async () => {
    bearedFetch.mockResolvedValue({ members: [], pagination: { totalItems: 0 } })
    renderHook(() => usePaginatedMembers({ search: 'a+b@x.org & co' }), { wrapper })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith(
      'organizations/0xorg/members?page=1&limit=10&search=a%2Bb%40x.org%20%26%20co'
    )
  })

  it('asks the server for the page, size and sort it is given', async () => {
    bearedFetch.mockResolvedValue({ members: [], pagination: { totalItems: 0 } })
    renderHook(() => usePaginatedMembers({ search: '', page: 3, limit: 50, sortBy: 'surname', sortOrder: 'desc' }), {
      wrapper,
    })

    await waitFor(() => expect(bearedFetch).toHaveBeenCalled())
    expect(bearedFetch).toHaveBeenCalledWith(
      'organizations/0xorg/members?page=3&limit=50&search=&sortBy=surname&sortOrder=desc'
    )
  })
})

describe('sign-in readiness', () => {
  const validateCensus = vi.fn()
  const missing = (ids: string[]) =>
    new VocdoniApiError(400, { error: 'invalid', data: { missingData: ids } }, 'invalid')

  beforeEach(() => {
    bearedFetch.mockReset().mockResolvedValue({ members: [{}], pagination: { totalItems: 5 } })
    validateCensus.mockReset()
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
      useClient: () => ({ client: { elections: { validateCensus } } }),
    })
  })

  afterEach(() => {
    resetReactProvidersMock()
  })

  it('counts as unreachable only the members missing both email and phone', () => {
    expect(computeReadiness(['a', 'b', 'c'], ['b', 'c', 'd'])).toEqual({
      missingEmail: 3,
      missingPhone: 3,
      unreachable: 2,
    })
  })

  it('asks the validation endpoint once for email and once for phone', async () => {
    validateCensus.mockImplementation(({ census }) =>
      Promise.reject(census.twoFaFields[0] === 'email' ? missing(['a', 'b']) : missing(['b', 'c']))
    )
    const { result } = renderHook(() => useSignInReadiness(), { wrapper })

    await waitFor(() => expect(result.current.available).toBe(true))
    expect(result.current).toMatchObject({ total: 5, ready: 4, unreachable: 1 })
    expect(validateCensus).toHaveBeenCalledWith({
      orgAddress: '0xorg',
      census: { authFields: [], twoFaFields: ['email'] },
    })
    expect(validateCensus).toHaveBeenCalledWith({
      orgAddress: '0xorg',
      census: { authFields: [], twoFaFields: ['phone'] },
    })
  })

  it('reads a 200 as everyone reachable', async () => {
    validateCensus.mockResolvedValue('OK')
    const { result } = renderHook(() => useSignInReadiness(), { wrapper })

    await waitFor(() => expect(result.current.available).toBe(true))
    expect(result.current).toMatchObject({ ready: 5, unreachable: 0 })
  })

  it('stays unavailable when validation fails for another reason', async () => {
    validateCensus.mockRejectedValue(new VocdoniApiError(500, { error: 'boom' }, 'boom'))
    const { result } = renderHook(() => useSignInReadiness(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.available).toBe(false)
  })
})
