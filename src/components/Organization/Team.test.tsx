import { mockUseClient, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: vi.fn(),
  }),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQuery: (options: { select?: (data: { users: unknown[]; pending: unknown[] }) => unknown }) => {
      const base = { users: [], pending: [] }
      const data = options?.select ? options.select(base) : base
      return { data, isLoading: false, isError: false, error: null }
    },
  }
})

describe('OrganizationUsers', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () =>
        mockUseClient({
          account: { address: '0xabc' },
        }),
    })
  })

  it('renders an empty state when no users exist', async () => {
    const TeamModule = await import('./Team')
    render(<TeamModule.OrganizationUsers />)

    expect(screen.getByText('No team members found')).toBeInTheDocument()
  })
})
