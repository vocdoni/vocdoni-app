import { MemoryRouter } from 'react-router-dom'
import { createTestI18n, render, screen } from '~src/test-utils'
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
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>,
      { i18nInstance }
    )

    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })
})
