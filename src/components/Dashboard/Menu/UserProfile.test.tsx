import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import UserProfile from './UserProfile'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ logout: vi.fn() }),
}))

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: { firstName: 'Jane', lastName: 'Doe' } }),
}))

vi.mock('~components/Account/SaasAccountProvider', () => ({
  useSaasAccount: () => ({ organization: { account: { avatar: '' } } }),
}))

vi.mock('./OrganizationSwitcher', () => ({
  OrganizationSwitcher: () => <div>Org Switcher</div>,
}))

vi.mock('~components/Layout/ColorModeSwitcher', () => ({
  ThemeToggleGroup: () => <div>Theme</div>,
}))

vi.mock('~components/Navbar/LanguagesList', () => ({
  LanguageListDashboard: () => <div>Languages</div>,
}))

describe('UserProfile', () => {
  it('renders profile name', () => {
    render(
      <TestMemoryRouter>
        <DashboardLayoutContext.Provider value={{ reduced: false } as any}>
          <UserProfile />
        </DashboardLayoutContext.Provider>
      </TestMemoryRouter>
    )

    expect(screen.getAllByText('Jane')[0]).toBeInTheDocument()
  })

  it('names the menu trigger after its visible text', () => {
    render(
      <TestMemoryRouter>
        <DashboardLayoutContext.Provider value={{ reduced: false } as any}>
          <UserProfile />
        </DashboardLayoutContext.Provider>
      </TestMemoryRouter>
    )

    expect(screen.getByRole('button', { name: /Jane/ })).toBeInTheDocument()
  })

  it('keeps the "User menu" label when the sidebar is reduced', () => {
    render(
      <TestMemoryRouter>
        <DashboardLayoutContext.Provider value={{ reduced: true } as any}>
          <UserProfile />
        </DashboardLayoutContext.Provider>
      </TestMemoryRouter>
    )

    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument()
  })
})
