import type { VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import legacyProcesses from './__fixtures__/legacy-processes.json'
import ProcessesTable from './ProcessesTable'

vi.mock('~i18n/use-date-fns', () => ({
  useDateFns: () => ({ format: () => '2026-01-01' }),
}))

vi.mock('./use-clone-as-draft', () => ({
  useCloneAsDraft: () => ({ cloneAsDraft: vi.fn() }),
}))

// Real prod responses of GET /processes (saas-api-lts, 2026-09-25) for legacy elections, which the
// backend projects read-only. The first is a legacy `multiple-choice` election: its question comes
// with an empty `type`, no `ballotProtocol` and no `metadata`, so no ballot type can be inferred.
// The second is a legacy single-choice election, projected with `type: 'singlechoice'`.
const processes = legacyProcesses.processes as unknown as VotingProcessResponse[]
const [uninferable, singleChoice] = processes

describe('ProcessesTable with legacy processes', () => {
  // Unlike ProcessesTable.test.tsx, the real QuestionsTypeBadge renders here: it is the one that
  // infers the ballot type, and it reads the election from the real react-providers context. So
  // every row gets a real ElectionProvider, seeded with its process and kept off the network.
  beforeEach(async () => {
    // the results read still fires; leave it pending rather than hitting the network
    vi.stubGlobal('fetch', () => new Promise(() => {}))
    const providers = await vi.importActual<typeof import('@vocdoni/react-providers')>('@vocdoni/react-providers')
    setReactProvidersMock({
      ElectionProvider: ({ id, children }: { id: string; children: ReactNode }) => (
        <providers.ElectionProvider
          election={processes.find((process) => process.id === id)!}
          queryOptions={{ staleTime: Infinity }}
        >
          {children}
        </providers.ElectionProvider>
      ),
      useElection: providers.useElection,
      useRoutedPagination: () => ({ pagination: null, initialPage: 1 }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    resetReactProvidersMock()
  })

  it('keeps the fixture shape the crash came from', () => {
    const question = uninferable.questions[0] as unknown as Record<string, unknown>
    expect(question.type).toBe('')
    expect(question).not.toHaveProperty('ballotProtocol')
    expect(question).not.toHaveProperty('metadata')
  })

  // The global matchMedia stub matches nothing, so this renders the mobile cards.
  it('renders every card when one question has no inferable ballot type', () => {
    render(
      <TestMemoryRouter>
        <ProcessesTable processes={processes} />
      </TestMemoryRouter>
    )

    expect(screen.getByText(uninferable.title.default)).toBeInTheDocument()
    expect(screen.getByText(singleChoice.title.default)).toBeInTheDocument()
    // Only the badge is lost: both cards keep the rest of their details.
    expect(screen.getAllByText(/recount:/i)).toHaveLength(2)
    expect(screen.getAllByText('question_types.singlechoice_title')).toHaveLength(1)
  })

  it('renders every table row when one question has no inferable ballot type', () => {
    // Every media query matches, so useBreakpointValue resolves `md` and the table renders.
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
          <ProcessesTable processes={processes} />
        </TestMemoryRouter>
      )

      // header + one full row per process (8 cells each)
      const rows = screen.getAllByRole('row')
      expect(rows).toHaveLength(3)
      expect(rows[1]).toHaveTextContent(uninferable.title.default)
      expect(rows[1].querySelectorAll('td')).toHaveLength(8)
      expect(rows[2]).toHaveTextContent(singleChoice.title.default)
      expect(rows[2]).toHaveTextContent('question_types.singlechoice_title')
    } finally {
      Object.defineProperty(window, 'matchMedia', { writable: true, value: original })
    }
  })
})
