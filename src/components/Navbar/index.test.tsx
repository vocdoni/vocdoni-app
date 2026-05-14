import { createTestI18n, render, screen, TestMemoryRouter } from '~src/test-utils'
import Navbar from './index'

const authState = vi.hoisted(() => ({
  isAuthenticated: false,
  memberNumber: null as string | null,
  logout: vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => authState,
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
    authState.isAuthenticated = false
    authState.memberNumber = null

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

  it('renders the shared census member number when it is available', async () => {
    authState.isAuthenticated = false
    authState.memberNumber = '12345'

    const i18nInstance = await createTestI18n({
      useReactI18next: true,
      resources: {
        en: {
          common: {
            'csp.fields.memberNumber': 'Member Number',
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

    expect(screen.getByText('Colegiado nº 12345')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
  })
})
