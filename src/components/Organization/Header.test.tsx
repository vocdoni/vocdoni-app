import { render, screen } from '~src/test-utils'
import { vi } from 'vitest'
import OrganizationHeader from './Header'

vi.mock('@vocdoni/react-providers', () => ({
  useOrganization: () => ({
    organization: { account: { name: { default: 'Test Org' } }, address: '0x123' },
  }),
  useClient: () => ({ account: { address: '0x123' } }),
}))

vi.mock('~shared/Layout/use-read-more', () => ({
  useReadMoreMarkdown: () => ({
    ReadMoreMarkdownWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ReadMoreMarkdownButton: () => <button>Read more</button>,
  }),
}))

vi.mock('./Address', () => ({
  default: () => <div>Address</div>,
}))

describe('OrganizationHeader', () => {
  it('renders organization name', () => {
    render(<OrganizationHeader />)
    expect(screen.getByText('Test Org')).toBeInTheDocument()
  })
})
