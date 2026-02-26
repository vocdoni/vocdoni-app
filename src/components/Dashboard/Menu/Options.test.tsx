import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { DashboardMenuOptions } from './Options'

const renderMenu = (pathname: string) => {
  render(
    <DashboardLayoutContext.Provider value={{ reduced: false }}>
      <TestMemoryRouter initialEntries={[pathname]}>
        <DashboardMenuOptions />
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

  it('marks memberbase as active on memberbase subroutes', () => {
    renderMenu('/admin/memberbase/groups')
    expect(getMenuItemElement('Memberbase')).toHaveAttribute('data-active', '')
  })

  it('marks settings as active on settings subroutes', () => {
    renderMenu('/admin/settings/team')
    expect(getMenuItemElement('settings')).toHaveAttribute('data-active', '')
  })
})
