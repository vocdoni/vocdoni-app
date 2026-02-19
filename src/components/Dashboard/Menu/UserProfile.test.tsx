import { MemoryRouter } from 'react-router-dom'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { render, screen } from '~src/test-utils'
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
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <DashboardLayoutContext.Provider value={{ reduced: false } as any}>
          <UserProfile />
        </DashboardLayoutContext.Provider>
      </MemoryRouter>
    )

    expect(screen.getAllByText('Jane')[0]).toBeInTheDocument()
  })
})
