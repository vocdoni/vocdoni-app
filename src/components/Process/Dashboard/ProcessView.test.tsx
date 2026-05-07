import { ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import type { ReactNode } from 'react'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { getProcessViewPathForTab, getProcessViewTabFromPath, ProcessView } from './ProcessView'

const navigateSpy = vi.fn()
let currentPathname = '/admin/process/0xabc'
let currentElectionId = '0xabc'
let currentElectionStatus = ElectionStatus.RESULTS

vi.mock('@vocdoni/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/sdk')>()

  class MockPublishedElection {}

  return {
    ...actual,
    PublishedElection: MockPublishedElection,
  }
})

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => navigateSpy,
    useLocation: () => ({
      pathname: currentPathname,
      search: '',
      hash: '',
      state: null,
      key: 'test-key',
    }),
  }
})

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')

  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionDescription: () => <div>ElectionDescription</div>,
    ElectionQuestions: () => <div>ElectionQuestions</div>,
    ElectionResults: () => <div>ElectionResults</div>,
    ElectionStatusBadge: () => <div>ElectionStatusBadge</div>,
    ElectionTitle: () => <div>ElectionTitle</div>,
  }
})

vi.mock('react-player', () => ({
  default: () => null,
}))

vi.mock('~components/Actions', () => ({
  ActionsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  ActionPause: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionContinue: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionEnd: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionCancel: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}))

const createPublishedElection = (id: string, status: ElectionStatus) =>
  Object.assign(new PublishedElection({} as never), {
    id,
    status,
    title: { default: 'Test election' },
    description: { default: 'Description' },
    startDate: new Date('2026-01-01T10:00:00Z'),
    endDate: new Date('2026-01-02T10:00:00Z'),
    electionType: { secretUntilTheEnd: false },
    voteType: { maxVoteOverwrites: 0 },
    voteCount: 10,
    census: { size: 25 },
    maxCensusSize: 25,
    streamUri: undefined,
    resultsType: undefined,
  }) as PublishedElection

describe('ProcessView route helpers', () => {
  it('uses questions as default tab for base process route', () => {
    expect(getProcessViewTabFromPath('/admin/process/0xabc')).toBe('questions')
  })

  it('uses questions as default tab for base process route with trailing slash', () => {
    expect(getProcessViewTabFromPath('/admin/process/0xabc/')).toBe('questions')
  })

  it('uses results tab when path ends with /results', () => {
    expect(getProcessViewTabFromPath('/admin/process/0xabc/results')).toBe('results')
  })

  it('uses results tab when path ends with /results and trailing slash', () => {
    expect(getProcessViewTabFromPath('/admin/process/0xabc/results/')).toBe('results')
  })

  it('builds results route from the declared dashboard results route', () => {
    expect(getProcessViewPathForTab('0xabc', 'results')).toBe('/admin/process/0xabc/results')
  })

  it('builds questions route from the declared dashboard process route', () => {
    expect(getProcessViewPathForTab('0xabc', 'questions')).toBe('/admin/process/0xabc')
  })
})

describe('ProcessView navigation', () => {
  beforeEach(() => {
    navigateSpy.mockReset()
    currentPathname = '/admin/process/0xabc'
    currentElectionId = '0xabc'
    currentElectionStatus = ElectionStatus.RESULTS
  })

  it('redirects the base route to results when election results are already available', async () => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () => ({
        id: currentElectionId,
        election: createPublishedElection(currentElectionId, currentElectionStatus),
        participation: 50,
        client: { explorerUrl: 'https://example.test' },
      }),
    })

    render(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc']}>
        <ProcessView />
      </TestMemoryRouter>
    )

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/admin/process/0xabc/results', { replace: true })
    })

    expect(screen.getByRole('button', { name: /election report \(pdf\)/i })).toBeInTheDocument()
  })

  it('does not force results again after the user comes back manually to questions', async () => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () => ({
        id: currentElectionId,
        election: createPublishedElection(currentElectionId, currentElectionStatus),
        participation: 50,
        client: { explorerUrl: 'https://example.test' },
      }),
    })

    const { rerender } = render(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc']}>
        <ProcessView />
      </TestMemoryRouter>
    )

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/admin/process/0xabc/results', { replace: true })
    })

    navigateSpy.mockClear()
    currentPathname = '/admin/process/0xabc/results'

    rerender(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc/results']}>
        <ProcessView />
      </TestMemoryRouter>
    )

    currentPathname = '/admin/process/0xabc'

    rerender(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc']}>
        <ProcessView />
      </TestMemoryRouter>
    )

    await waitFor(() => {
      expect(navigateSpy).not.toHaveBeenCalled()
    })
  })

  it('resolves the default tab again when navigating to a different process id', async () => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () => ({
        id: currentElectionId,
        election: createPublishedElection(currentElectionId, currentElectionStatus),
        participation: 50,
        client: { explorerUrl: 'https://example.test' },
      }),
    })

    const { rerender } = render(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc']}>
        <ProcessView />
      </TestMemoryRouter>
    )

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/admin/process/0xabc/results', { replace: true })
    })

    navigateSpy.mockClear()
    currentElectionId = '0xdef'
    currentPathname = '/admin/process/0xdef'

    rerender(
      <TestMemoryRouter initialEntries={['/admin/process/0xdef']}>
        <ProcessView />
      </TestMemoryRouter>
    )

    await waitFor(() => {
      expect(navigateSpy).toHaveBeenCalledWith('/admin/process/0xdef/results', { replace: true })
    })
  })
})
