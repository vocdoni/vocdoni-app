import { render, screen, TestMemoryRouter } from '~src/test-utils'
import NoElections from './NoElections'

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({ account: { address: '0xabc' } }),
  useOrganization: () => ({ organization: { address: '0xabc' } }),
}))

describe('NoElections', () => {
  it('renders the create voting button when user owns the org', () => {
    render(
      <TestMemoryRouter>
        <NoElections />
      </TestMemoryRouter>
    )

    expect(screen.getByText('menu.create')).toBeInTheDocument()
  })
})
