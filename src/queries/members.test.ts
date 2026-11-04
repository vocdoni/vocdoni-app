import { renderHook, waitFor } from '@testing-library/react'
import { getAuthMock, setAuthMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { AllProviders, mockUseOrganization } from '~src/test-utils'
import { useAddMembers, useEditMember, useImportJobProgress } from './members'

// Explicit file-level mock so renderHook sees the stubbed useAuth; the setup-file
// global mock is picked up by render() wrappers but not by bare renderHook calls.
vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useOutletContext: () => ({ jobId: 'job-1', setJobId: vi.fn() }),
  }
})

describe('useImportJobProgress', () => {
  it('is disabled and does not fetch when organization is null', () => {
    // organization stays null (default mock); query must not fire
    const { result } = renderHook(() => useImportJobProgress(), {
      wrapper: AllProviders,
    })

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('is enabled when organization and jobId are both set', async () => {
    const bearedFetch = vi.fn().mockResolvedValue({ jobId: 'job-1', type: 'org_members', status: 'completed' })
    setAuthMock({ bearedFetch })
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xabc' } }),
    })

    const { result } = renderHook(() => useImportJobProgress(), {
      wrapper: AllProviders,
    })

    await waitFor(() => expect(result.current.data).toBeDefined())
    expect(bearedFetch).toHaveBeenCalled()
  })
})

describe('useAddMembers', () => {
  it('does not throw during render when organization is null', () => {
    // organization stays null (default mock); hook body must not throw
    expect(() => {
      renderHook(() => useAddMembers(), { wrapper: AllProviders })
    }).not.toThrow()
  })

  it('rejects with "No organization loaded" and never calls bearedFetch when organization is null', async () => {
    const bearedFetch = vi.fn()
    setAuthMock({ bearedFetch })

    const { result } = renderHook(() => useAddMembers(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({})).rejects.toThrow('No organization loaded')
    expect(bearedFetch).not.toHaveBeenCalled()
  })

  it('posts to the correct URL when organization is set', async () => {
    const bearedFetch = vi.fn().mockResolvedValue({ count: 1 })
    setAuthMock({ bearedFetch })
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })

    const { result } = renderHook(() => useAddMembers(false), { wrapper: AllProviders })
    await result.current.mutateAsync([{ name: 'Test' }])

    expect(bearedFetch).toHaveBeenCalledWith(
      expect.stringContaining('organizations/0xorg/members?async=false'),
      expect.any(Object)
    )
  })

  it('posts to the async URL when isAsync is true', async () => {
    const bearedFetch = vi.fn().mockResolvedValue({ count: 1, jobId: 'j1' })
    setAuthMock({ bearedFetch })
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })

    const { result } = renderHook(() => useAddMembers(true), { wrapper: AllProviders })
    await result.current.mutateAsync([])

    expect(bearedFetch).toHaveBeenCalledWith(
      expect.stringContaining('organizations/0xorg/members?async=true'),
      expect.any(Object)
    )
  })
})

describe('useEditMember', () => {
  it('does not throw during render when organization is null', () => {
    expect(() => {
      renderHook(() => useEditMember(), { wrapper: AllProviders })
    }).not.toThrow()
  })

  it('rejects with "No organization loaded" when organization is null', async () => {
    const bearedFetch = vi.fn()
    setAuthMock({ bearedFetch })

    const { result } = renderHook(() => useEditMember(), { wrapper: AllProviders })

    await expect(result.current.mutateAsync({ id: 'm1' })).rejects.toThrow('No organization loaded')
    expect(bearedFetch).not.toHaveBeenCalled()
  })
})
