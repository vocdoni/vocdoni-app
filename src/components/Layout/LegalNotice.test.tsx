import LegalNotice from './LegalNotice'
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
})
