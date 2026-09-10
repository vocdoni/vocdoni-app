import type { QuestionStatus, VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { getProcessViewPathForTab, getProcessViewTabFromPath, ProcessView } from './ProcessView'

const navigateSpy = vi.fn()
let currentPathname = '/admin/process/0xabc'
let currentElectionId = '0xabc'
let currentElectionStatus: QuestionStatus = 'RESULTS'

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
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

let earlyEndDate: Date | null = null

vi.mock('~queries/process-end-date', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~queries/process-end-date')>()),
  useProcessEarlyEndDate: () => ({ data: earlyEndDate }),
}))

vi.mock('~components/Actions', () => ({
  ActionsProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  ActionPause: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionContinue: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionEnd: ({ children }: { children: ReactNode }) => <button>{children}</button>,
  ActionCancel: ({ children }: { children: ReactNode }) => <button>{children}</button>,
}))

// New-model process: the per-question status drives both the derived process status and
// hasResults(), which is what triggers the default redirect to the results tab.
const createProcess = (id: string, status: QuestionStatus, anonymous = false): VotingProcessResponse => ({
  id,
  orgAddress: '0xorg',
  title: { default: 'Test election' },
  description: { default: 'Description' },
  startDate: '2026-01-01T10:00:00Z',
  endDate: '2026-01-02T10:00:00Z',
  published: true,
  census: anonymous ? { anonymous: true } : {},
  questions: [
    {
      id: `${id}-q1`,
      parentProcessId: id,
      title: { default: 'Question' },
      choices: [{ title: { default: 'Choice' }, value: 0 }],
      ballotProtocol: {
        costExponent: 1,
        costFromWeight: false,
        maxVoteOverwrites: 0,
        maxCount: 1,
        maxValue: 1,
        maxTotalCost: 1,
        uniqueValues: false,
      },
      type: 'singleChoice',
      secretUntilTheEnd: false,
      status,
    },
  ],
})

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
    currentElectionStatus = 'RESULTS'
  })

  it('redirects the base route to results when election results are already available', async () => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () => ({
        id: currentElectionId,
        election: createProcess(currentElectionId, currentElectionStatus),
        status: currentElectionStatus,
        results: null,
        loading: false,
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

    // The redirect does not unmount the sidebar control panel. By text, not
    // role+name: jsdom cannot measure, so the sidebar is closed (hence hidden),
    // and accessible names skip text inside a hidden subtree.
    expect(screen.getByText('End vote')).toBeInTheDocument()
  })

  it('does not force results again after the user comes back manually to questions', async () => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () => ({
        id: currentElectionId,
        election: createProcess(currentElectionId, currentElectionStatus),
        status: currentElectionStatus,
        results: null,
        loading: false,
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
        election: createProcess(currentElectionId, currentElectionStatus),
        status: currentElectionStatus,
        results: null,
        loading: false,
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

describe('ProcessView schedule', () => {
  const renderSchedule = () => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () => ({
        id: '0xabc',
        election: createProcess('0xabc', 'RESULTS'),
        status: 'RESULTS',
        results: null,
        loading: false,
        client: { explorerUrl: 'https://example.test' },
      }),
    })

    return render(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc']}>
        <ProcessView />
      </TestMemoryRouter>
    )
  }

  afterEach(() => {
    earlyEndDate = null
  })

  it('shows the configured end for a process that ran its course', async () => {
    earlyEndDate = null

    renderSchedule()

    expect(await screen.findByText('End date')).toBeInTheDocument()
    expect(screen.getByText('January 2nd, 2026')).toBeInTheDocument()
  })

  it('shows when voting actually stopped for a process ended ahead of schedule', async () => {
    // The configured end (Jan 2) never happened, so the dashboard must not show it as the end.
    earlyEndDate = new Date('2026-01-01T15:42:00Z')

    renderSchedule()

    expect(await screen.findByText('End date')).toBeInTheDocument()
    // The process started Jan 1 and was stopped the same day, so both date fields read Jan 1 —
    // the load-bearing assertion is that the configured Jan 2 end is gone.
    expect(screen.getAllByText('January 1st, 2026')).toHaveLength(2)
    expect(screen.queryByText('January 2nd, 2026')).toBeNull()
  })

  it('keeps one end field rather than a second "actual end" row', async () => {
    earlyEndDate = new Date('2026-01-01T15:42:00Z')

    renderSchedule()

    expect(await screen.findByText('End date')).toBeInTheDocument()
    expect(screen.queryByText(/actual end/i)).toBeNull()
  })
})

describe('ProcessView voting settings', () => {
  const renderWithCensus = (anonymous: boolean) => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () => ({
        id: '0xabc',
        election: createProcess('0xabc', 'ONGOING', anonymous),
        status: 'ONGOING',
        results: null,
        loading: false,
        client: { explorerUrl: 'https://example.test' },
      }),
    })

    return render(
      <TestMemoryRouter initialEntries={['/admin/process/0xabc']}>
        <ProcessView />
      </TestMemoryRouter>
    )
  }

  it('reports an anonymous census in the voting settings', async () => {
    renderWithCensus(true)

    expect(await screen.findByText('Voter anonymity')).toBeInTheDocument()
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
  })

  it('reports a private ballot when the census is not anonymous', async () => {
    renderWithCensus(false)

    expect(await screen.findByText('Voter anonymity')).toBeInTheDocument()
    expect(screen.getByText('Private')).toBeInTheDocument()
  })

  it('offers the mechanism behind an anonymous census as a tooltip', async () => {
    // The subtext is `nowrap` and has room for one word, so the technology is explained in a
    // tooltip on the label rather than inline.
    renderWithCensus(true)

    const label = await screen.findByText('Voter anonymity')

    expect(label.closest('[data-part="trigger"]')).not.toBeNull()
  })

  it('offers no tooltip for a private census, which has no mechanism to explain', async () => {
    renderWithCensus(false)

    const label = await screen.findByText('Voter anonymity')

    expect(label.closest('[data-part="trigger"]')).toBeNull()
  })
})
