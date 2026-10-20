import { fireEvent } from '@testing-library/react'
import { UNSAFE_ErrorResponseImpl as ErrorResponseImpl } from 'react-router'
import RouteErrorComponent, { ErrorView } from './Error'
import { VochainNotFoundError } from '~src/legacy/vochain-archive'
import { Routes } from '~src/router/routes'
import { createTestI18n, render, screen } from '~src/test-utils'
import { capturePosthogException } from '~utils/analytics'

const useRouteError = vi.fn()
const navigate = vi.fn()
const location = { pathname: '/processes/0xabc' }
const auth = { isAuthenticated: false }

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')

  return {
    ...actual,
    useRouteError: () => useRouteError(),
    useLocation: () => location,
    useNavigate: () => navigate,
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => auth,
}))

vi.mock('~utils/analytics', () => ({ capturePosthogException: vi.fn() }))

describe('ErrorView', () => {
  const createI18nInstance = () =>
    createTestI18n({
      useReactI18next: true,
      resources: {
        en: {
          common: {
            error: {
              crash_title: 'Something went wrong',
              crash_description: 'Reload the page or go back to the dashboard.',
              go_to_dashboard: 'Go to dashboard',
              not_found: 'Page Not Found',
              not_found_description: 'The page you are looking for does not exist.',
              reload: 'Reload',
              return_to_home: 'Back to home',
            },
          },
        },
      },
    })

  beforeEach(() => {
    useRouteError.mockReset()
    navigate.mockReset()
    vi.mocked(capturePosthogException).mockClear()
    location.pathname = '/processes/0xabc'
    auth.isAuthenticated = false
  })

  it('renders the shared 404 UI when normalized as not found', async () => {
    const i18nInstance = await createI18nInstance()

    render(<ErrorView isNotFound returnHomeHref='/' />, { i18nInstance })

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
  })

  it('renders friendly recovery copy for a non-404 error', async () => {
    const i18nInstance = await createI18nInstance()

    render(<ErrorView returnHomeHref='/ca' />, { i18nInstance })

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/ca')
  })

  it('reloads the page from the reload button', async () => {
    const i18nInstance = await createI18nInstance()
    const reload = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, reload })

    render(<ErrorView />, { i18nInstance })
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }))

    expect(reload).toHaveBeenCalledTimes(1)
    vi.restoreAllMocks()
  })

  it('never shows the raw error text of a route crash', async () => {
    const i18nInstance = await createI18nInstance()
    useRouteError.mockReturnValue(
      new Error("Failed to execute 'insertBefore' on 'Node': The node is not a child of this node.")
    )

    render(<RouteErrorComponent />, { i18nInstance })

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.queryByText(/insertBefore/)).not.toBeInTheDocument()
  })

  it('reports a route crash to PostHog once, with its route', async () => {
    const i18nInstance = await createI18nInstance()
    const error = new Error('Route exploded')
    useRouteError.mockReturnValue(error)

    const { rerender, unmount } = render(<RouteErrorComponent />, { i18nInstance })
    rerender(<RouteErrorComponent />)
    unmount()
    render(<RouteErrorComponent />, { i18nInstance })

    expect(capturePosthogException).toHaveBeenCalledTimes(1)
    expect(capturePosthogException).toHaveBeenCalledWith(error, { route: '/processes/0xabc' })
  })

  it.each([
    ['an archive not-found error', new VochainNotFoundError('election')],
    ['a router 404', new ErrorResponseImpl(404, 'Not Found', null)],
  ])('shows the 404 view and does not report %s', async (_, error) => {
    const i18nInstance = await createI18nInstance()
    useRouteError.mockReturnValue(error)

    render(<RouteErrorComponent />, { i18nInstance })

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(capturePosthogException).not.toHaveBeenCalled()
  })

  it('sends signed-in admins back to the dashboard', async () => {
    const i18nInstance = await createI18nInstance()
    auth.isAuthenticated = true
    location.pathname = '/admin/processes/create'
    useRouteError.mockReturnValue(new Error('Boom'))

    render(<RouteErrorComponent />, { i18nInstance })
    fireEvent.click(screen.getByRole('button', { name: 'Go to dashboard' }))

    expect(navigate).toHaveBeenCalledWith(Routes.dashboard.base)
  })

  it('sends everyone else back home', async () => {
    const i18nInstance = await createI18nInstance()
    useRouteError.mockReturnValue(new Error('Boom'))

    render(<RouteErrorComponent />, { i18nInstance })
    fireEvent.click(screen.getByRole('button', { name: 'Back to home' }))

    expect(navigate).toHaveBeenCalledWith(Routes.root)
  })
})
