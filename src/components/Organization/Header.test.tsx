import React from 'react'
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
    OrganizationName: ({ as: Tag = 'p', title }: { as?: React.ElementType; title?: string }) => <Tag>{title}</Tag>,
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
          organization: { name: { default: 'Test Org' }, address: '0x123' },
        }),
      useClient: () => mockUseClient({ account: { address: '0x123' } }),
    })
  })

  it('renders organization name as the page h1', () => {
    render(<OrganizationHeader />)
    expect(screen.getByRole('heading', { level: 1, name: 'Test Org' })).toBeInTheDocument()
  })
})
