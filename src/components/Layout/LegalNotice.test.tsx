import { createMemoryRouter, RouterProvider } from 'react-router-dom'
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
          account: { name: { default: 'Esquerra republicana' } },
          address: '0xabc',
        },
      }),
    })
  })

  it('renders on the process route with the organization name and link', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/processes/:id',
          id: 'process-view',
          loader: async () => ({ organizationId: '0xabc' }),
          element: <LegalNotice />,
        },
      ],
      { initialEntries: ['/processes/123'] }
    )

    render(<RouterProvider router={router} />)

    expect(await screen.findByTestId('layout-legal-notice')).toHaveTextContent(
      'To ensure a secure, verifiable and transparent vote, Esquerra republicana uses the Vocdoni platform'
    )
    expect(screen.getByRole('link', { name: 'vocdoni.io' })).toHaveAttribute('href', 'https://vocdoni.io/')
  })

  it('does not render on a non-process route', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/organization/:address',
          loader: async () => ({ address: '0xabc' }),
          element: <LegalNotice />,
        },
      ],
      { initialEntries: ['/organization/0xabc'] }
    )

    render(<RouterProvider router={router} />)

    expect(screen.queryByTestId('layout-legal-notice')).not.toBeInTheDocument()
  })
})
