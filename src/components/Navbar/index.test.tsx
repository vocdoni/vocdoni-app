import { render, screen, TestMemoryRouter } from '~src/test-utils'
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
  it('renders the logo link', () => {
    render(
      <TestMemoryRouter>
        <Navbar />
      </TestMemoryRouter>
    )

    expect(screen.getByRole('link', { name: 'Logo Esquerra Republicana' })).toHaveAttribute('href', '/')
  })
})
