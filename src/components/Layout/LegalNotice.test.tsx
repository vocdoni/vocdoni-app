import LegalNotice, { StaticLegalNotice } from './LegalNotice'
import { render, screen } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')

  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

describe('LegalNotice', () => {
  beforeEach(() => {
    resetReactProvidersMock()
    setReactProvidersMock({
      useOrganization: () => ({
        organization: {
          name: { default: 'Esquerra republicana' },
          address: '0xabc',
        },
      }),
    })
  })

  it('renders the expected organization name and link', () => {
    render(<LegalNotice />)

    expect(screen.getByText('Esquerra republicana')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'vocdoni.io' })).toHaveAttribute('href', 'https://vocdoni.io/')
  })

  it('falls back to the organization address when the account name is missing', () => {
    setReactProvidersMock({
      useOrganization: () => ({
        organization: {
          address: '0xabc',
        },
      }),
    })

    render(<LegalNotice />)

    expect(screen.getByText('0xabc')).toBeInTheDocument()
  })

  describe('StaticLegalNotice', () => {
    beforeEach(() => {
      // The real hook throws outside its provider: the static variant must never reach it.
      setReactProvidersMock({
        useOrganization: () => {
          throw new Error('useOrganization() must be used inside <OrganizationProvider>')
        },
      })
    })

    it('renders from the orgName prop without reading the organization context', () => {
      render(<StaticLegalNotice orgName='Legacy org' />)

      expect(screen.getByText('Legacy org')).toBeInTheDocument()
    })

    it('renders nothing when orgName is empty', () => {
      render(<StaticLegalNotice orgName='' />)

      expect(screen.queryByTestId('layout-legal-notice')).not.toBeInTheDocument()
    })

    it('renders nothing when orgName is undefined', () => {
      render(<StaticLegalNotice orgName={undefined} />)

      expect(screen.queryByTestId('layout-legal-notice')).not.toBeInTheDocument()
    })
  })
})
