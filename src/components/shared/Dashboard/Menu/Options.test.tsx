import { MemoryRouter } from 'react-router-dom'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { render, screen } from '~src/test-utils'
import { DashboardMenuOptions } from './Options'

describe('DashboardMenuOptions', () => {
  it('renders platform section items', () => {
    render(
      <DashboardLayoutContext.Provider value={{ reduced: false }}>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <DashboardMenuOptions />
        </MemoryRouter>
      </DashboardLayoutContext.Provider>
    )

    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('organization.dashboard')).toBeInTheDocument()
  })
})
