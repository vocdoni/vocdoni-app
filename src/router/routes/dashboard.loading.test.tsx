import { QueryClient } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { type ReactNode, useMemo } from 'react'
import { createMemoryRouter, Link, RouterProvider } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from '~queries/keys'
import { useProfile } from '~src/queries/account'
import { createTestQueryClient, renderWithProviders } from '~src/test-utils'
import { Routes } from '.'

// The admin route tree as it ships, with the guards and the frame's content area real, and only
// the session, the network and the page modules faked.

const pages = vi.hoisted(() => {
  const deferred = () => {
    let resolve: () => void = () => undefined
    const promise = new Promise<void>((r) => (resolve = r))
    return { promise, resolve }
  }
  return { profileImported: vi.fn(), allProcesses: deferred() }
})

vi.mock('~components/Auth/useAuth', () => ({ useAuth: vi.fn() }))
vi.mock('~src/queries/account', () => ({ useProfile: vi.fn() }))
vi.mock('~src/queries/organization', () => ({ usePrefetchOrganization: () => undefined }))
vi.mock('~src/router/OrganizationProtectedRoute', async () => {
  const { Outlet } = await import('react-router')
  return { default: () => <Outlet /> }
})

const getElection = vi.fn()
vi.mock('~src/providers/ApiClientProvider', async () => {
  const { ClientProvider } =
    await vi.importActual<typeof import('@vocdoni/react-providers')>('@vocdoni/react-providers')
  return {
    ApiClientProvider: ({ children }: { children: ReactNode }) => (
      <ClientProvider apiUrl='http://test.local'>{children}</ClientProvider>
    ),
    AUTH_STORAGE_KEY: 'auth',
    useApiClient: () => ({ client: { elections: { get: getElection } } }),
  }
})

vi.mock('~elements/LayoutDashboard', async () => {
  const { DashboardOutlet } = await import('~elements/DashboardOutlet')
  return {
    default: () => (
      <div>
        <nav>
          <Link to={Routes.dashboard.processes.base}>Votes</Link>
        </nav>
        <DashboardOutlet />
      </div>
    ),
  }
})

vi.mock('~elements/dashboard', () => ({ default: () => <div>Home page</div> }))
vi.mock('~elements/dashboard/profile', () => {
  pages.profileImported()
  // Never resolves: the cold-load test only checks when the download starts.
  return new Promise(() => undefined)
})
vi.mock('~elements/dashboard/processes', async () => {
  const { Outlet } = await import('react-router')
  return { default: () => <Outlet /> }
})
vi.mock('~elements/dashboard/processes/all', async () => {
  await pages.allProcesses.promise
  return { default: () => <div>All votes page</div> }
})
vi.mock('~elements/dashboard/processes/view', async () => {
  const { useLoaderData } = await import('react-router')
  return {
    default: () => {
      const election = useLoaderData() as { title: string }
      return <div>Process {election.title}</div>
    },
  }
})

const mockSession = (ready: boolean) => {
  vi.mocked(useAuth).mockReturnValue({
    isAuthenticated: true,
    isAuthLoading: !ready,
    currentAddress: ready ? '0xorg' : undefined,
    unconfirmedAddress: '0xorg',
  } as never)
  vi.mocked(useProfile).mockReturnValue({
    data: ready
      ? { organizations: [{ role: 'admin', isIntegrator: false, organization: { address: '0xorg' } }] }
      : undefined,
    isLoading: !ready,
  } as never)
}

const renderAdmin = async (path: string, queryClient = createTestQueryClient()) => {
  const { useDashboardRoutes } = await import('./dashboard')
  const App = () => {
    const dashboard = useDashboardRoutes()
    const router = useMemo(() => createMemoryRouter([dashboard], { initialEntries: [path] }), [])
    return <RouterProvider router={router} />
  }
  return renderWithProviders(<App />, { queryClient })
}

describe('admin app loading states', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts downloading the page while the session is still being confirmed, behind one skeleton', async () => {
    mockSession(false)

    await renderAdmin(Routes.dashboard.profile)

    expect(await screen.findByText('Votes')).toBeInTheDocument()
    await waitFor(() => expect(pages.profileImported).toHaveBeenCalledTimes(1))
    expect(screen.getAllByText('loading')).toHaveLength(1)
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('keeps the current page on screen, with a pending bar, until the next page is ready', async () => {
    mockSession(true)
    await renderAdmin(Routes.dashboard.base)
    expect(await screen.findByText('Home page')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Votes'))

    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(screen.queryByText('loading')).not.toBeInTheDocument()

    await act(async () => pages.allProcesses.resolve())

    expect(await screen.findByText('All votes page')).toBeInTheDocument()
    expect(screen.queryByText('Home page')).not.toBeInTheDocument()
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })

  it('opens a process a list already fetched from the cache, without fetching it again', async () => {
    mockSession(true)
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(QueryKeys.election.process('0xabc'), { id: '0xabc', title: 'From the list' })

    await renderAdmin('/admin/process/0xabc', queryClient)

    expect(await screen.findByText('Process From the list')).toBeInTheDocument()
    expect(getElection).not.toHaveBeenCalled()
  })

  it('refreshes in the background a process the list fetched a while ago', async () => {
    mockSession(true)
    getElection.mockResolvedValue({ id: '0xold', title: 'Refreshed' })
    const queryClient = createTestQueryClient()
    queryClient.setQueryData(
      QueryKeys.election.process('0xold'),
      { id: '0xold', title: 'From the list' },
      { updatedAt: Date.now() - 60_000 }
    )

    await renderAdmin('/admin/process/0xold', queryClient)

    expect(await screen.findByText('Process From the list')).toBeInTheDocument()
    await waitFor(() =>
      expect(queryClient.getQueryData(QueryKeys.election.process('0xold'))).toEqual({ id: '0xold', title: 'Refreshed' })
    )
    expect(getElection).toHaveBeenCalledTimes(1)
  })

  it('reports a process that does not exist after a single request', async () => {
    mockSession(true)
    getElection.mockRejectedValue(new Error('not found'))
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: (count) => count < 3 } } })

    await renderAdmin('/admin/process/0xgone', queryClient)

    await waitFor(() => expect(queryClient.getQueryState(QueryKeys.election.process('0xgone'))?.status).toBe('error'))
    expect(getElection).toHaveBeenCalledTimes(1)
  })

  it('fetches a process the cache does not hold, once, and keeps it for the view', async () => {
    mockSession(true)
    getElection.mockResolvedValue({ id: '0xdef', title: 'Fetched' })
    const queryClient = createTestQueryClient()

    await renderAdmin('/admin/process/0xdef', queryClient)

    expect(await screen.findByText('Process Fetched')).toBeInTheDocument()
    expect(getElection).toHaveBeenCalledTimes(1)
    expect(getElection).toHaveBeenCalledWith('0xdef')
    expect(queryClient.getQueryData(QueryKeys.election.process('0xdef'))).toEqual({ id: '0xdef', title: 'Fetched' })
  })
})
