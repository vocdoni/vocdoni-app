import { mockUseClient, mockUseOrganization, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import NoElections from './NoElections'

describe('NoElections', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () => mockUseClient({ account: { address: '0xabc' } }),
      useOrganization: () => mockUseOrganization({ organization: { address: '0xabc' } }),
    })
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
