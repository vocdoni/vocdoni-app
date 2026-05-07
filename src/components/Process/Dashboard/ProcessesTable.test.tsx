import userEvent from '@testing-library/user-event'
import { ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import type { ReactNode } from 'react'
import { fireEvent, mockUseElection, render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import ProcessesTable from './ProcessesTable'

vi.mock('@vocdoni/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/sdk')>()

  class MockPublishedElection {}

  return {
    ...actual,
    PublishedElection: MockPublishedElection,
  }
})

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

const election = Object.assign(new PublishedElection({} as never), {
  id: '0x1',
  title: { default: 'Test Election' },
  startDate: new Date('2026-01-01T00:00:00Z'),
  endDate: new Date('2026-01-02T00:00:00Z'),
  status: ElectionStatus.ONGOING,
  electionType: { secretUntilTheEnd: false },
  voteCount: 5,
  census: { size: 10 },
  maxCensusSize: 10,
  questions: [],
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

  it('renders election title', () => {
    render(
      <TestMemoryRouter>
        <ProcessesTable processes={[election as any]} />
      </TestMemoryRouter>
    )
    expect(screen.getByText('Test Election')).toBeInTheDocument()
  })

  it('shows the pdf download action in the row menu', async () => {
    const endedElection = Object.assign(new PublishedElection({} as never), election, {
      status: ElectionStatus.RESULTS,
    })
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
