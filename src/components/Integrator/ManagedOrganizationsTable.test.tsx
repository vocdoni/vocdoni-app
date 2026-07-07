import { ManagedOrganization } from '~src/queries/integrators'
import { render, screen } from '~src/test-utils'
import { ManagedOrganizationsTable } from './ManagedOrganizationsTable'

const org = (overrides: Partial<ManagedOrganization> = {}): ManagedOrganization => ({
  address: '0x1234567890abcdef1234567890abcdef12345678',
  website: '',
  createdAt: '2025-01-15T00:00:00Z',
  type: 'others',
  active: true,
  ...overrides,
})

describe('ManagedOrganizationsTable', () => {
  it('renders the org name with its address and counters', () => {
    render(
      <ManagedOrganizationsTable
        organizations={[
          org({
            name: { default: 'Acme' },
            counters: { processes: 7, sentSMS: 3, sentEmails: 9, subOrgs: 0, users: 0 },
          }),
        ]}
      />
    )

    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('0x123456…5678')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('falls back to the website when the org has no name', () => {
    render(<ManagedOrganizationsTable organizations={[org({ website: 'https://example.com', active: false })]} />)

    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('0x123456…5678')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('falls back to the address when the org has no name and no website', () => {
    render(<ManagedOrganizationsTable organizations={[org({ active: false })]} />)

    expect(screen.getByText('0x123456…5678')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })
})
