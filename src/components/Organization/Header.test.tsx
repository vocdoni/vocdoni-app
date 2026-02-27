import { mockUseClient, mockUseOrganization, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import OrganizationHeader from './Header'

vi.mock('~components/Layout/use-read-more', () => ({
  useReadMoreMarkdown: () => ({
    ReadMoreMarkdownWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ReadMoreMarkdownButton: () => <button>Read more</button>,
  }),
}))

vi.mock('./Address', () => ({
  default: () => <div>Address</div>,
}))

describe('OrganizationHeader', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useOrganization: () =>
        mockUseOrganization({
          organization: { account: { name: { default: 'Test Org' } }, address: '0x123' },
        }),
      useClient: () => mockUseClient({ account: { address: '0x123' } }),
    })
  })

  it('renders organization name', () => {
    render(<OrganizationHeader />)
    expect(screen.getByText('Test Org')).toBeInTheDocument()
  })
})
