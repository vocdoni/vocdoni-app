import { render, screen } from '~src/test-utils'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: vi.fn(),
  }),
}))

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({
    account: { address: '0xabc' },
  }),
  enforceHexPrefix: (value: string) => value,
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
  it('renders an empty state when no users exist', async () => {
    const TeamModule = await import('./Team')
    render(<TeamModule.OrganizationUsers />)

    expect(screen.getByText('No team members found')).toBeInTheDocument()
  })
})
