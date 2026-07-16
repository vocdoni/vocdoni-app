import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { mockUseOrganization, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { DraftsTable, useDeleteDraft } from './drafts'

const toastSpy = vi.fn()
const bearedFetchMock = vi.fn().mockResolvedValue(undefined)

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: bearedFetchMock,
  }),
}))

// DraftsContextMenu (rendered by both the card and the row) pulls in the create-process
// wizard; stub it so the list layout tests stay focused on the mobile/desktop branch.
vi.mock('~components/Process/Create', () => ({
  useCreateProcess: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock('~components/Toast', () => ({
  useToast: () => toastSpy,
  ToastProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
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
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
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

describe('DraftsTable layout', () => {
  const draft = {
    id: 'draft-1',
    metadata: {
      title: 'My draft',
      startDate: '2026-01-01',
      endDate: '2026-01-02',
      questionType: 'single',
    },
  } as any

  // The global matchMedia stub matches nothing, so useBreakpointValue resolves the `base` value
  // and the list renders stacked cards instead of the desktop table.
  it('renders stacked cards without a table on mobile', () => {
    render(
      <TestMemoryRouter>
        <DraftsTable drafts={[draft]} />
      </TestMemoryRouter>
    )

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument()
    // Card view renders the dates as inline labelled lines ("Start date: …").
    expect(screen.getByText(/start date:/i)).toBeInTheDocument()
    expect(screen.getByText(/end date:/i)).toBeInTheDocument()
  })

  it('renders the table with column headers on desktop widths', () => {
    // Pretend every media query matches (jsdom has no layout), so useBreakpointValue resolves
    // the `md` value and the table branch renders instead of the mobile cards.
    const original = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => true,
      }),
    })

    try {
      render(
        <TestMemoryRouter>
          <DraftsTable drafts={[draft]} />
        </TestMemoryRouter>
      )

      expect(screen.getByRole('table')).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'Start date' })).toBeInTheDocument()
      expect(screen.getByRole('columnheader', { name: 'End date' })).toBeInTheDocument()
      // The inline "Start date:" card lines are specific to the mobile view.
      expect(screen.queryByText(/start date:/i)).not.toBeInTheDocument()
    } finally {
      Object.defineProperty(window, 'matchMedia', { writable: true, value: original })
    }
  })
})
