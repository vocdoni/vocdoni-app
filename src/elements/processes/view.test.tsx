import { createTestMemoryRouter, render, screen, TestRouterProvider } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import Process from './view'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')

  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

vi.mock('~components/Process/View', () => ({
  __esModule: true,
  ProcessView: () => <div>Process view content</div>,
}))

vi.mock('~components/Process/Archive/View', () => ({
  __esModule: true,
  default: () => <div>Archive view content</div>,
}))

const routerFutureFlags = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
} as const

describe('Process view', () => {
  beforeEach(() => {
    resetReactProvidersMock()
    setReactProvidersMock({
      useOrganization: () => ({
        organization: {
          name: { default: 'Esquerra republicana' },
          address: '0xabc',
        },
      }),
      useElection: () => ({
        election: null,
      }),
    })
  })

  it('renders the legal notice on the process route', async () => {
    const router = createTestMemoryRouter(
      [
        {
          path: '/processes/:id',
          id: 'process-view',
          loader: async () => ({ era: 'saas', election: { id: '123', orgAddress: 'abc' } }),
          element: <Process />,
        },
      ],
      {
        initialEntries: ['/processes/123'],
        future: routerFutureFlags,
      }
    )

    render(<TestRouterProvider router={router} />)

    expect(await screen.findByTestId('layout-legal-notice')).toHaveTextContent(
      'To ensure a secure, verifiable and transparent vote, Esquerra republicana uses the Vocdoni platform'
    )
    expect(screen.getByRole('link', { name: 'vocdoni.io' })).toHaveAttribute('href', 'https://vocdoni.io/')
  })

  it('renders the archive-era legal notice without an OrganizationProvider', async () => {
    // The real hook throws outside its provider; the archive path must never reach it.
    setReactProvidersMock({
      useOrganization: () => {
        throw new Error('useOrganization() must be used inside <OrganizationProvider>')
      },
    })

    const legacyId = '6be21a5a9dc0df48fb84a39242adec0f72812132d5ec0886c454020000000000'
    const router = createTestMemoryRouter(
      [
        {
          path: '/processes/:id',
          id: 'process-view',
          loader: async () => ({
            era: 'archive',
            legacyElection: { id: legacyId, organizationId: 'df48fb84a39242adec0f72812132d5ec0886c454' },
            legacyOrganization: {
              address: 'df48fb84a39242adec0f72812132d5ec0886c454',
              account: { name: { default: 'Legacy org' } },
            },
          }),
          element: <Process />,
        },
      ],
      {
        initialEntries: [`/processes/${legacyId}`],
        future: routerFutureFlags,
      }
    )

    render(<TestRouterProvider router={router} />)

    expect(await screen.findByTestId('layout-legal-notice')).toHaveTextContent(
      'To ensure a secure, verifiable and transparent vote, Legacy org uses the Vocdoni platform'
    )
  })

  it('does not render the legal notice on another route', async () => {
    const router = createTestMemoryRouter(
      [
        {
          path: '/organization/:address',
          loader: async () => ({ address: '0xabc' }),
          element: <div>Organization page</div>,
        },
      ],
      {
        initialEntries: ['/organization/0xabc'],
        future: routerFutureFlags,
      }
    )

    render(<TestRouterProvider router={router} />)

    expect(screen.queryByTestId('layout-legal-notice')).not.toBeInTheDocument()
  })
})
