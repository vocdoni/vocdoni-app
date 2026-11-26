import { useNavigate } from 'react-router'
import { DashboardMenuConfig } from '~components/Dashboard/Menu/menus'
import { LocalStorageKeys } from '~constants'
import { Routes } from '~src/router/routes'
import { act, fireEvent, render, screen, TestMemoryRouter, waitFor, within } from '~src/test-utils'
import DashboardShell from './DashboardShell'

const mockUseIsDesktop = vi.fn(() => false)

vi.mock('~components/ui/useIsMobile', () => ({
  useIsDesktop: () => mockUseIsDesktop(),
  useIsMobile: () => !mockUseIsDesktop(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0xabc', logout: vi.fn() }),
}))

vi.mock('@vocdoni/react-components', async () => {
  const actual = await vi.importActual<typeof import('@vocdoni/react-components')>('@vocdoni/react-components')
  return { ...actual, OrganizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</> }
})

vi.mock('~components/Organization/OrganizationGate', () => ({
  OrganizationGate: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('~components/Account/SaasAccountProvider', () => ({
  useSaasAccount: () => ({ organization: { account: { name: { default: 'Ateneu de Vallnova' }, avatar: '' } } }),
}))

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: { firstName: 'Marta', lastName: 'Soler', email: 'marta@example.org' } }),
}))

vi.mock('~src/queries/organization', () => ({
  useTutorials: () => ({ isSidebarTutorialClosed: true, isLoading: false, closeSidebarTutorial: vi.fn() }),
}))

vi.mock('~components/SupportChat', () => ({ default: () => null }))
// The pending bar reads the data router's navigation, which the memory router here does not have
vi.mock('~components/Layout/NavigationPendingBar', () => ({ NavigationPendingBar: () => null }))
vi.mock('~components/Layout/AnnouncementBanner', () => ({ default: () => null }))

// One navigation link per menu, so a test can navigate from inside the drawer.
vi.mock('~components/Dashboard/Menu/Options', () => ({
  DashboardMenuOptions: () => {
    const navigate = useNavigate()
    return (
      <button type='button' onClick={() => navigate(Routes.dashboard.profile)}>
        Go to profile
      </button>
    )
  },
}))

const menu: DashboardMenuConfig = {
  homeRoute: Routes.dashboard.base,
  homeLabel: 'Dashboard',
  sections: [],
}

// The segment inside the account menu starts its zag machine in a microtask after mount; flush it inside act.
const renderShell = async () => {
  let view!: ReturnType<typeof render>
  await act(async () => {
    view = render(
      <TestMemoryRouter initialEntries={[Routes.dashboard.base]}>
        <DashboardShell menu={menu} />
      </TestMemoryRouter>
    )
  })
  return view
}

const menuButton = () => screen.getByRole('button', { name: 'Open menu' })

describe('DashboardShell', () => {
  beforeEach(() => {
    mockUseIsDesktop.mockReturnValue(false)
    localStorage.clear()
  })

  it('shows the top bar with the menu button, the organization and the account below lg', async () => {
    await renderShell()
    const topBar = screen.getByRole('banner')
    expect(topBar).toBeVisible()
    expect(within(topBar).getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false')
    expect(within(topBar).getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-haspopup', 'dialog')
    expect(within(topBar).getByText('Ateneu de Vallnova')).toBeInTheDocument()
    expect(within(topBar).getByRole('button', { name: /^User menu/ })).toBeInTheDocument()
  })

  it('keeps the sidebar out of view below lg', async () => {
    await renderShell()
    // jsdom applies the base styles, where the sidebar is display:none: its links are not reachable.
    expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Dashboard', hidden: true })).not.toBeVisible()
  })

  it('opens the navigation drawer from the menu button and closes it with Escape', async () => {
    await renderShell()
    const button = menuButton()
    fireEvent.click(button)

    const drawer = await screen.findByRole('dialog', { name: 'Menu' })
    // The open drawer hides the rest of the page from assistive technology, so the button is held from before.
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(within(drawer).getByRole('link', { name: 'Dashboard' })).toBeInTheDocument()
    expect(within(drawer).getByRole('button', { name: 'Close menu' })).toBeInTheDocument()

    // Focus moves into the drawer once it traps it; only then does it listen for Escape.
    await waitFor(() => expect(drawer).toContainElement(document.activeElement as HTMLElement))
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument())
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the drawer from its close button', async () => {
    await renderShell()
    fireEvent.click(menuButton())
    const drawer = await screen.findByRole('dialog', { name: 'Menu' })

    fireEvent.click(within(drawer).getByRole('button', { name: 'Close menu' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument())
  })

  it('closes the drawer after navigating to another section', async () => {
    await renderShell()
    fireEvent.click(menuButton())
    const drawer = await screen.findByRole('dialog', { name: 'Menu' })

    fireEvent.click(within(drawer).getByRole('button', { name: 'Go to profile' }))
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument())
  })

  it('closes the drawer once the screen reaches lg', async () => {
    const { rerender } = await renderShell()
    fireEvent.click(menuButton())
    await screen.findByRole('dialog', { name: 'Menu' })

    mockUseIsDesktop.mockReturnValue(true)
    await act(async () => {
      rerender(
        <TestMemoryRouter initialEntries={[Routes.dashboard.base]}>
          <DashboardShell menu={menu} />
        </TestMemoryRouter>
      )
    })
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Menu' })).not.toBeInTheDocument())
  })

  it('collapses only the sidebar: below lg the drawer keeps the full menu', async () => {
    localStorage.setItem(LocalStorageKeys.DashboardMenuReduced, 'true')
    await renderShell()
    fireEvent.click(menuButton())
    const drawer = await screen.findByRole('dialog', { name: 'Menu' })
    // A reduced menu names its account button "User menu"; the full one shows the person's name.
    expect(within(drawer).getByRole('button', { name: /Marta/ })).toBeInTheDocument()
  })

  it('collapses the sidebar from lg when the stored preference says so', async () => {
    localStorage.setItem(LocalStorageKeys.DashboardMenuReduced, 'true')
    mockUseIsDesktop.mockReturnValue(true)
    await renderShell()
    expect(screen.getByLabelText('Expand menu')).toBeInTheDocument()
  })
})
