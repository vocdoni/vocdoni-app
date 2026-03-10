import { mockUseClient, mockUseOrganization, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import OrganizationHeader from './Header'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    OrganizationImage: ({ alt }: { alt?: string }) => <img alt={alt ?? 'OrganizationImage'} />,
    OrganizationName: ({ title }: { title?: string }) => <p>{title}</p>,
    OrganizationDescription: () => <p>OrganizationDescription</p>,
  }
})

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
