import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { quantity } from '~utils/numbers'
import { UsageLimits } from './UsageLimits'

vi.mock('~components/Account/SaasAccountProvider', () => ({
  useSaasAccount: () => ({
    isLoading: false,
    organization: { counters: { processes: 3 } },
  }),
}))

const members = vi.hoisted(() => ({ total: 50 }))

vi.mock('~queries/members', () => ({
  usePaginatedMembers: () => ({ data: { pagination: { totalItems: members.total } } }),
}))

describe('UsageLimits', () => {
  beforeEach(() => {
    members.total = 50
  })

  it('renders the usage section', () => {
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )
    expect(screen.getByText('Usage')).toBeInTheDocument()
  })

  it('caps the memberbase at the fixed organization limit', () => {
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    expect(screen.getByText(`/ ${(50_000).toLocaleString()}`)).toBeInTheDocument()
  })

  it('shows the voting process count from the organization, without a cap or progress bar', () => {
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    expect(screen.getByText('Voting processes')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.queryByText(/\/ 1$/)).not.toBeInTheDocument()
    expect(screen.getAllByRole('progressbar')).toHaveLength(1)
  })

  it('explains that the memberbase is full once it reaches the fixed limit', () => {
    members.total = 50_000
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    expect(
      screen.getByText(`Your memberbase has reached the limit of ${quantity(50_000)} members.`)
    ).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows no limit message below the fixed limit', () => {
    members.total = 49_999
    render(
      <TestMemoryRouter>
        <UsageLimits />
      </TestMemoryRouter>
    )

    expect(screen.queryByText(/has reached the limit/)).not.toBeInTheDocument()
  })
})
