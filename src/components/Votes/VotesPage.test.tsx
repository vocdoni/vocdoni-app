import userEvent from '@testing-library/user-event'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import { render, screen, TestMemoryRouter, within } from '~src/test-utils'
import legacyProcesses from './__fixtures__/legacy-processes.json'
import { VotesPage } from './VotesPage'

const votes = vi.hoisted(() => ({
  data: [] as unknown[],
  error: null as unknown,
  isLoading: false,
  results: vi.fn((_ids: readonly string[]) => ({})),
}))

vi.mock('~queries/votes', () => ({
  useOrganizationVotes: () => ({ data: votes.data, error: votes.error, isLoading: votes.isLoading }),
  useVotesResults: (ids: readonly string[]) => votes.results(ids),
  useCanManageVotes: () => true,
  useDeleteDraft: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('~components/Process/Dashboard/use-clone-as-draft', () => ({
  useCloneAsDraft: () => ({ cloneAsDraft: vi.fn(), isCloning: false }),
}))
vi.mock('@vocdoni/react-components', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@vocdoni/react-components')>()),
  useOrganization: () => ({ organization: { address: '0xorg' } }),
}))
vi.mock('~components/ui/ResponsiveMenu', () => ({
  ResponsiveMenu: ({ trigger }: { trigger?: ReactNode }) => <div>{trigger}</div>,
}))
// One row can be made to throw, to prove the others survive it.
vi.mock('./VoteListRow', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./VoteListRow')>()
  return {
    VoteListRow: (props: Parameters<typeof actual.VoteListRow>[0]) => {
      if (props.row.process.title?.default === 'Boom') throw new Error('boom')
      return <actual.VoteListRow {...props} />
    },
  }
})

const DAY = 86_400_000
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * DAY).toISOString()

const make = (id: string, title: string, over: Record<string, unknown> = {}, status = 'ONGOING') =>
  ({
    id,
    orgAddress: '0xorg',
    published: true,
    title: { default: title },
    census: { size: 100 },
    startDate: iso(-2),
    endDate: iso(5),
    questions: [
      {
        id: `${id}-q`,
        title: { default: 'Q' },
        choices: [
          { title: { default: 'Yes' }, value: 0 },
          { title: { default: 'No' }, value: 1 },
        ],
        type: 'singlechoice',
        status,
      },
    ],
    ...over,
  }) as unknown as VotingProcessResponse

// The nine votes of the audit: three live (one paused), two ready, one draft, three closed (one canceled).
const nine = () => [
  make('live1', 'Assemblea General'),
  make('live2', 'Pressupost'),
  make('paused1', 'Assemblea Econòmica', {}, 'PAUSED'),
  make('ready1', 'Eleccions', { startDate: iso(3) }),
  make('ready2', 'Consulta', { startDate: iso(6) }),
  make('draft1', 'Esborrany', { published: false, endDate: undefined }),
  make('closed1', 'Tancada A', { startDate: iso(-20), endDate: iso(-10) }, 'ENDED'),
  make('closed2', 'Tancada B', { startDate: iso(-30), endDate: iso(-20) }, 'ENDED'),
  make('canceled1', 'Anul·lada', { startDate: iso(-40), endDate: iso(-30) }, 'CANCELED'),
]

const Probe = () => {
  const { pathname, search } = useLocation()
  return <output data-testid='location'>{pathname + search}</output>
}

const renderPage = (path = '/admin/processes/all/1') =>
  render(
    <TestMemoryRouter initialEntries={[path]}>
      <VotesPage />
      <Probe />
    </TestMemoryRouter>
  )

const articles = () => screen.queryAllByRole('article')

const useDesktop = () => {
  const original = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
  return () => Object.defineProperty(window, 'matchMedia', { writable: true, value: original })
}

beforeEach(() => {
  votes.data = nine()
  votes.error = null
  votes.isLoading = false
  votes.results.mockClear()
})

describe('VotesPage', () => {
  it('counts every state in the filter chips', () => {
    renderPage()
    const expected = { All: '9', Live: '3', Ready: '2', Drafts: '1', Closed: '3' }
    for (const [label, count] of Object.entries(expected)) {
      expect(screen.getByRole('button', { name: `${label} ${count}` })).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: 'All 9' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Live 3' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('lists only live and paused votes on the live filter', () => {
    renderPage('/admin/processes/live/1')
    expect(articles()).toHaveLength(3)
    expect(screen.getByRole('button', { name: 'Live 3' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Eleccions')).not.toBeInTheDocument()
  })

  it('promotes the first live vote on page 1 and does not repeat it', () => {
    renderPage()
    expect(screen.getAllByText('Assemblea General')).toHaveLength(1)
    expect(articles()[0]).toHaveTextContent('Assemblea General')
    expect(articles()).toHaveLength(9)
  })

  it('asks for results of the promoted vote and the closed votes of the page only', () => {
    renderPage()
    expect(votes.results).toHaveBeenLastCalledWith(['live1', 'closed1', 'closed2'])
  })

  it('searches without accents and keeps the text in the URL', async () => {
    renderPage()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search a vote' }), 'economica')
    expect(screen.getByText('Assemblea Econòmica')).toBeInTheDocument()
    expect(articles()).toHaveLength(1)
    expect(screen.getByTestId('location')).toHaveTextContent('?q=economica')
  })

  it('keeps the search when the filter changes', async () => {
    renderPage('/admin/processes/all/1?q=assemblea')
    await userEvent.click(screen.getByRole('button', { name: /^Live/ }))
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/processes/live/1?q=assemblea')
  })

  it('shows the empty layout when there are no votes', () => {
    votes.data = []
    renderPage()
    expect(screen.getByText('No votes yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create a vote' })).toBeInTheDocument()
  })

  it('says so when no vote matches', async () => {
    renderPage('/admin/processes/all/1?q=zzz')
    expect(screen.getByText('No vote matches')).toBeInTheDocument()
  })

  it('shows the alert when the list fails to load', () => {
    votes.data = []
    votes.error = new Error('down')
    renderPage()
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load voting processes')
    expect(screen.queryByText('No votes yet')).not.toBeInTheDocument()
  })

  it('renders one row per legacy process, none with a duplicate button', () => {
    votes.data = legacyProcesses.processes
    renderPage()
    expect(articles()).toHaveLength(legacyProcesses.processes.length)
    expect(screen.queryByRole('button', { name: /duplicate/i })).not.toBeInTheDocument()
  })

  it('keeps the other rows when one row throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    votes.data = [make('a', 'Alpha'), make('b', 'Boom'), make('c', 'Gamma', { startDate: iso(3) })]
    renderPage()
    expect(screen.getByText('This vote could not be shown.')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    spy.mockRestore()
  })

  it('focuses the search on / with a draft row on screen', async () => {
    const restore = useDesktop()
    renderPage()
    await userEvent.keyboard('/')
    expect(screen.getByRole('searchbox', { name: 'Search a vote' })).toHaveFocus()
    restore()
  })

  it('opens the create form on n', async () => {
    const restore = useDesktop()
    renderPage()
    await userEvent.keyboard('n')
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/processes/create')
    restore()
  })

  it('marks the list region with the current filter', () => {
    renderPage('/admin/processes/drafts/1')
    const section = screen.getByRole('region', { name: 'Drafts' })
    expect(within(section).getAllByRole('article')).toHaveLength(1)
  })
})
