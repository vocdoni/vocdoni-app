import { mockUseOrganization, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock, setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import NoElections from './NoElections'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

describe('NoElections', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0xabc' } }),
    })
    setAuthMock({ currentAddress: '0xabc' })
  })

  it('renders the create voting button when user owns the org', () => {
    render(
      <TestMemoryRouter>
        <NoElections />
      </TestMemoryRouter>
    )

    expect(screen.getByText('menu.create')).toBeInTheDocument()
  })
})
