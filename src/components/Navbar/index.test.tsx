import { createTestI18n, render, screen, TestMemoryRouter } from '~src/test-utils'
import Navbar from './index'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false, logout: vi.fn() }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useMatches: () => [],
  }
})

describe('Navbar', () => {
  it('renders the login button when not authenticated', async () => {
    const i18nInstance = await createTestI18n({
      useReactI18next: true,
      resources: {
        en: {
          common: {
            'menu.login': 'Login',
          },
        },
      },
    })

    render(
      <TestMemoryRouter>
        <Navbar />
      </TestMemoryRouter>,
      { i18nInstance }
    )

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })

  it('renders the authenticated voter label instead of the dashboard button', async () => {
    const i18nInstance = await createTestI18n({
      useReactI18next: true,
      resources: {
        en: {
          common: {
            'menu.login': 'Login',
            'menu.dashboard': 'Dashboard',
          },
        },
      },
    })

    render(
      <TestMemoryRouter>
        <Navbar authenticatedLabel={{ label: 'Colegiado nº', value: '15516' }} />
      </TestMemoryRouter>,
      { i18nInstance }
    )

    expect(screen.getByText('Colegiado nº 15516')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
  })

  it('hides the admin button when requested', async () => {
    const i18nInstance = await createTestI18n({
      useReactI18next: true,
      resources: {
        en: {
          common: {
            'menu.login': 'Login',
            'menu.dashboard': 'Dashboard',
          },
        },
      },
    })

    render(
      <TestMemoryRouter>
        <Navbar hideAuthButton />
      </TestMemoryRouter>,
      { i18nInstance }
    )

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
  })
})
