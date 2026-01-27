import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { useDeleteDraft } from './drafts'

const toastSpy = vi.fn()
const bearedFetchMock = vi.fn().mockResolvedValue(undefined)

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: bearedFetchMock,
  }),
}))

vi.mock('@vocdoni/react-providers', () => ({
  useOrganization: () => ({
    organization: { address: '0xorg' },
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, string>) => opts?.defaultValue ?? _key,
  }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}))

vi.mock('~shared/Toast', () => ({
  useToast: () => toastSpy,
}))

const createWrapper = (queryClient: QueryClient) => {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useDeleteDraft', () => {
  beforeEach(() => {
    bearedFetchMock.mockClear()
    toastSpy.mockClear()
  })

  it('shows success toast when deleting a draft normally', async () => {
    const queryClient = new QueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteDraft(), { wrapper: createWrapper(queryClient) })

    await act(async () => {
      await result.current.mutateAsync({ draftId: 'draft-1' })
    })

    expect(bearedFetchMock).toHaveBeenCalledWith(ApiEndpoints.OrganizationProcess.replace('{processId}', 'draft-1'), {
      method: 'DELETE',
    })
    expect(toastSpy).toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('suppresses the toast when called with silent=true', async () => {
    const queryClient = new QueryClient()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useDeleteDraft(), { wrapper: createWrapper(queryClient) })

    await act(async () => {
      await result.current.mutateAsync({ draftId: 'draft-2', silent: true })
    })

    expect(toastSpy).not.toHaveBeenCalled()
    expect(invalidateSpy).toHaveBeenCalled()
  })

  it('propagates errors without showing a success toast', async () => {
    const queryClient = new QueryClient()
    const error = new Error('boom')
    bearedFetchMock.mockRejectedValueOnce(error)
    const { result } = renderHook(() => useDeleteDraft(), { wrapper: createWrapper(queryClient) })

    await expect(result.current.mutateAsync({ draftId: 'draft-3' })).rejects.toThrow(error)
    expect(toastSpy).not.toHaveBeenCalled()
  })
})
