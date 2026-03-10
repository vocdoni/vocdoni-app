import type { ReactNode } from 'react'
import { mockUseElection, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
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

const election = {
  id: '0x1',
  title: { default: 'Test Election' },
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  status: 'ONGOING',
  electionType: { secretUntilTheEnd: false },
  voteCount: 5,
}

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
})
