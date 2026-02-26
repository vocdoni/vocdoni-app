import type { ReactNode } from 'react'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import ProcessesTable from './ProcessesTable'

const election = {
  id: '0x1',
  title: { default: 'Test Election' },
  startDate: new Date().toISOString(),
  endDate: new Date().toISOString(),
  status: 'ONGOING',
  electionType: { secretUntilTheEnd: false },
  voteCount: 5,
}

vi.mock('@vocdoni/react-providers', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-providers')
  return {
    ...actual,
    ElectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
    useElection: () => ({ election, localize: (key: string) => key, client: { explorerUrl: 'https://example.test' } }),
    useRoutedPagination: () => ({ pagination: null, initialPage: 1 }),
  }
})

vi.mock('~i18n/use-date-fns', () => ({
  useDateFns: () => ({ format: () => '2026-01-01' }),
}))

vi.mock('./use-clone-as-draft', () => ({
  useCloneAsDraft: () => ({ cloneAsDraft: vi.fn() }),
}))

describe('ProcessesTable', () => {
  it('renders election title', () => {
    render(
      <TestMemoryRouter>
        <ProcessesTable processes={[election as any]} />
      </TestMemoryRouter>
    )
    expect(screen.getByText('Test Election')).toBeInTheDocument()
  })
})
