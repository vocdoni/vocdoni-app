import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { fireEvent, mockUseElection, render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { createElection, createQuestion } from '../VotingReportPdf/__fixtures__'
import ProcessesTable from './ProcessesTable'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    QuestionsTypeBadge: () => <div>QuestionsTypeBadge</div>,
    ElectionStatusBadge: () => <div>ElectionStatusBadge</div>,
  }
})

const election = createElection({
  id: '0x1',
  title: { default: 'Test Election' },
  census: { size: 10 },
  questions: [createQuestion({ status: 'ONGOING' })],
})

vi.mock('~i18n/use-date-fns', () => ({
  useDateFns: () => ({ format: () => '2026-01-01' }),
}))

vi.mock('./use-clone-as-draft', () => ({
  useCloneAsDraft: () => ({ cloneAsDraft: vi.fn() }),
}))

describe('ProcessesTable', () => {
  beforeEach(() => {
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () =>
        mockUseElection({
          election,
          localize: (key: string) => key,
          client: { explorerUrl: 'https://example.test' },
        }),
      useRoutedPagination: () => ({ pagination: null, initialPage: 1 }),
    })
  })

  // setReactProvidersMock mutates a module-level singleton; reset it so provider
  // overrides never leak into other suites (the global setup also resets, belt-and-suspenders).
  afterEach(() => {
    resetReactProvidersMock()
  })

  it('renders election title', () => {
    render(
      <TestMemoryRouter>
        <ProcessesTable processes={[election as any]} />
      </TestMemoryRouter>
    )
    expect(screen.getByText('Test Election')).toBeInTheDocument()
  })

  it('shows the pdf download action in the row menu', async () => {
    const endedElection = { ...election, questions: [createQuestion({ status: 'RESULTS' })] }
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
      useElection: () =>
        mockUseElection({
          election: endedElection as any,
          localize: (key: string) => key,
          client: { explorerUrl: 'https://example.test' },
        }),
      useRoutedPagination: () => ({ pagination: null, initialPage: 1 }),
    })

    render(
      <TestMemoryRouter>
        <ProcessesTable processes={[endedElection as any]} />
      </TestMemoryRouter>
    )

    fireEvent.click(screen.getByLabelText('Open actions'))

    await waitFor(() => {
      expect(screen.getByText('Election report (PDF)')).toBeInTheDocument()
    })
  })

  // The global matchMedia stub matches nothing, so useBreakpointValue resolves the `base` value
  // and the list renders stacked cards instead of the desktop table.
  it('renders stacked cards without a table on mobile', () => {
    render(
      <TestMemoryRouter>
        <ProcessesTable processes={[election as any]} />
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
          <ProcessesTable processes={[election as any]} />
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

  it('opens the public voting page with a single localized prefix from the dashboard', async () => {
    render(
      <TestMemoryRouter basename='/ca' initialEntries={['/ca/admin/processes']}>
        <ProcessesTable processes={[election as any]} />
      </TestMemoryRouter>
    )

    await userEvent.click(screen.getByRole('button', { name: /open actions/i }))

    expect(await screen.findByRole('menuitem', { name: /public voting page/i })).toHaveAttribute(
      'href',
      '/en/processes/0x1'
    )
  })
})
