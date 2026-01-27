import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '~src/test-utils'
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
  it('renders the mobile menu trigger', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
      </MemoryRouter>
    )

    expect(screen.getByLabelText('Open Menu')).toBeInTheDocument()
  })
})
