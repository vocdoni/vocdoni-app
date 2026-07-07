import { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { useAdminMenuConfig } from './menus'
import { DashboardMenuOptions } from './Options'

// Renders the admin options through the real admin config so the assertions below exercise the
// actual nav items and active-match logic.
const AdminOptions = () => {
  const { sections } = useAdminMenuConfig()
  return <DashboardMenuOptions sections={sections} />
}

const renderMenu = (pathname: string) => {
  render(
    <DashboardLayoutContext.Provider value={{ reduced: false }}>
      <TestMemoryRouter initialEntries={[pathname]}>
        <AdminOptions />
      </TestMemoryRouter>
    </DashboardLayoutContext.Provider>
  )
}

const getMenuItemElement = (label: string) => {
  const element = screen.getByText(label).closest('a,button')
  expect(element).toBeTruthy()
  return element as HTMLElement
}

describe('DashboardMenuOptions', () => {
  it('renders platform section items', () => {
    renderMenu('/admin')

    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('organization.dashboard')).toBeInTheDocument()
  })

  it('marks dashboard as active only on /admin', () => {
    renderMenu('/admin')

    const dashboard = getMenuItemElement('organization.dashboard')
    const votingProcesses = getMenuItemElement('voting_processes')
    const memberbase = getMenuItemElement('Memberbase')
    const settings = getMenuItemElement('settings')

    expect(dashboard).toHaveAttribute('data-active', '')
    expect(votingProcesses).not.toHaveAttribute('data-active')
    expect(memberbase).not.toHaveAttribute('data-active')
    expect(settings).not.toHaveAttribute('data-active')
  })

  it('marks voting processes as active on processes list', () => {
    renderMenu('/admin/processes/all/1/active')
    expect(getMenuItemElement('voting_processes')).toHaveAttribute('data-active', '')
  })

  it('marks voting processes as active on process details', () => {
    renderMenu('/admin/process/abc123')
    expect(getMenuItemElement('voting_processes')).toHaveAttribute('data-active', '')
  })

  it('marks voting processes as active on process results', () => {
    renderMenu('/admin/process/abc123/results')
    expect(getMenuItemElement('voting_processes')).toHaveAttribute('data-active', '')
  })

  it('marks memberbase as active on memberbase subroutes', () => {
    renderMenu('/admin/memberbase/groups')
    expect(getMenuItemElement('Memberbase')).toHaveAttribute('data-active', '')
  })

  it('marks settings as active on settings subroutes', () => {
    renderMenu('/admin/settings/team')
    expect(getMenuItemElement('settings')).toHaveAttribute('data-active', '')
  })
})
