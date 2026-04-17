import RouteErrorComponent, { ErrorView } from './Error'
import { createTestI18n, render, screen } from '~src/test-utils'

const useRouteError = vi.fn()
const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useRouteError: () => useRouteError(),
    useLocation: () => ({ pathname: '/processes/0xabc' }),
    useNavigate: () => navigate,
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
  }),
}))

describe('ErrorView', () => {
  const createI18nInstance = () =>
    createTestI18n({
      useReactI18next: true,
      resources: {
        en: {
          common: {
            error: {
              loading_page: 'Error loading the page',
              not_found: 'Page Not Found',
              not_found_description: 'The page you are looking for does not exist.',
              return_to_home: 'Back to home',
            },
          },
        },
      },
    })

  beforeEach(() => {
    useRouteError.mockReset()
    navigate.mockReset()
  })

  it('renders the shared 404 UI when normalized as not found', async () => {
    const i18nInstance = await createI18nInstance()

    render(<ErrorView isNotFound returnHomeHref='/' />, { i18nInstance })

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('renders the generic error message when normalized as a non-404 error', async () => {
    const i18nInstance = await createI18nInstance()

    render(<ErrorView message='Boom' />, { i18nInstance })

    expect(screen.getByText('Error loading the page')).toBeInTheDocument()
    expect(screen.getByText('Boom')).toBeInTheDocument()
  })

  it('maps react-router errors through the shared presenter', async () => {
    const i18nInstance = await createI18nInstance()
    useRouteError.mockReturnValue(new Error('Route exploded'))

    render(<RouteErrorComponent />, { i18nInstance })

    expect(screen.getByText('Error loading the page')).toBeInTheDocument()
    expect(screen.getByText('Error: Route exploded')).toBeInTheDocument()
  })
})
