import { act, useSyncExternalStore } from 'react'
import { createTestMemoryRouter, mockUseOrganization, render, screen, TestRouterProvider } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { Routes } from '~routes'
import Votings from './Votings'

const listMock = vi.fn()

// A shared store rather than per-consumer state: more than one component in this tree
// calls useAuth() (NoElections does too), and they must all see the same address — the
// real AuthContext is shared. Changing it re-renders them without touching the URL, which
// is the transition the per-render router recreation used to cover.
const addressListeners = new Set<() => void>()
let currentAddress: string | undefined

const setAddress = (address?: string) => {
  currentAddress = address
  addressListeners.forEach((notify) => notify())
}

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    currentAddress: useSyncExternalStore(
      (notify) => {
        addressListeners.add(notify)
        return () => addressListeners.delete(notify)
      },
      () => currentAddress
    ),
  }),
}))

vi.mock('~src/providers/ApiClientProvider', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~src/providers/ApiClientProvider')>()),
  useApiClient: () => ({ client: { elections: { list: listMock } } }),
}))

vi.mock('../../Process/Dashboard/ProcessesTable', () => ({
  default: ({ processes }: { processes: { id: string }[] }) => (
    <div data-testid='processes-table'>{processes.map((process) => process.id).join(',')}</div>
  ),
}))

const listResponse = (ids: string[]) => ({
  processes: ids.map((id) => ({ id })),
  pagination: { totalItems: ids.length, currentPage: 1, lastPage: 1, previousPage: null, nextPage: null },
})

// Rendered through the real route so useParams() sees the `:page?/:status?` segments.
const renderAt = (path: string) =>
  render(
    <TestRouterProvider
      router={createTestMemoryRouter(
        [{ path: Routes.dashboard.processes.all, element: <Votings path={Routes.dashboard.processes.all} /> }],
        { initialEntries: [path] }
      )}
    />
  )

afterEach(() => {
  resetReactProvidersMock()
})

describe('Votings', () => {
  beforeEach(() => {
    listMock.mockReset()
    currentAddress = '0xorg'
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
  })

  it('lists the elections of the active organization', async () => {
    listMock.mockResolvedValue(listResponse(['p1', 'p2']))

    renderAt('/admin/processes/all/1')

    expect(await screen.findByTestId('processes-table')).toHaveTextContent('p1,p2')
    expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ orgAddress: '0xorg', published: true }))
  })

  // The router used to be recreated on every render, and that recreation is what re-ran the
  // route loader once the address resolved. Without a loader the query has to do it itself.
  it('fetches once the address resolves, with no route change', async () => {
    currentAddress = undefined
    listMock.mockResolvedValue(listResponse(['p1']))

    renderAt('/admin/processes/all/1')

    expect(listMock).not.toHaveBeenCalled()

    await act(async () => setAddress('0xorg'))

    expect(await screen.findByTestId('processes-table')).toHaveTextContent('p1')
  })

  it('refetches when the active organization changes, with no route change', async () => {
    listMock.mockResolvedValue(listResponse(['p1']))

    renderAt('/admin/processes/all/1')
    expect(await screen.findByTestId('processes-table')).toHaveTextContent('p1')

    listMock.mockResolvedValue(listResponse(['other']))
    await act(async () => setAddress('0xother'))

    expect(await screen.findByTestId('processes-table')).toHaveTextContent('other')
    expect(listMock).toHaveBeenLastCalledWith(expect.objectContaining({ orgAddress: '0xother' }))
  })

  it('surfaces a load failure instead of an empty list', async () => {
    listMock.mockRejectedValue(new Error('boom'))

    renderAt('/admin/processes/all/1')

    expect(await screen.findByText('boom')).toBeTruthy()
    expect(screen.queryByTestId('processes-table')).toBeNull()
  })

  describe('param merge (preserved from the removed route loader)', () => {
    beforeEach(() => listMock.mockResolvedValue(listResponse([])))

    it('reads page and status from the route params', async () => {
      renderAt('/admin/processes/all/2/results')

      // `results` is the legacy name the SAAS status union maps onto ENDED
      await vi.waitFor(() =>
        expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ page: 2, status: 'ENDED' }))
      )
    })

    it('reads limit from the query string', async () => {
      renderAt('/admin/processes/all/1?limit=5')

      await vi.waitFor(() => expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ limit: 5 })))
    })

    it('leaves limit unset when the query string omits it', async () => {
      renderAt('/admin/processes/all/1')

      await vi.waitFor(() => expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ limit: undefined })))
    })

    it('falls back to the query string when the optional segment is absent', async () => {
      // React Router expands `:page?/:status?` into separate branches, so an unmatched
      // optional segment is absent from `params` rather than present-and-undefined — the
      // query string is not clobbered. Same as the route loader, which matched identically.
      renderAt('/admin/processes/all/1?status=paused')

      await vi.waitFor(() => expect(listMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'PAUSED' })))
    })
  })
})
