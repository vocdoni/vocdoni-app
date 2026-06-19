import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { Routes } from '~src/router/routes'
import { fireEvent, render, screen, TestMemoryRouter } from '~src/test-utils'
import DashboardMenu from './index'

const mockUseTutorials = vi.fn(() => ({
  isSidebarTutorialClosed: true,
  isLoading: false,
  closeSidebarTutorial: vi.fn(),
}))
const mockUseMediaQuery = vi.fn(() => [false])

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual<typeof import('@chakra-ui/react')>('@chakra-ui/react')
  return {
    ...actual,
    useMediaQuery: () => mockUseMediaQuery(),
  }
})

vi.mock('~src/queries/organization', () => ({
  useTutorials: () => mockUseTutorials(),
}))

vi.mock('./UserProfile', () => ({
  default: () => <div>UserProfile</div>,
}))

vi.mock('./Options', () => ({
  DashboardMenuOptions: () => <div>MenuOptions</div>,
}))

vi.mock('~queries/integrator', () => ({
  useIntegratorInfo: () => ({ data: undefined }),
}))

const renderMenu = (reduced: boolean, onToggleReduced = vi.fn()) =>
  render(
    <DashboardLayoutContext.Provider value={{ reduced } as any}>
      <TestMemoryRouter>
        <DashboardMenu isOpen={false} onClose={vi.fn()} onToggleReduced={onToggleReduced} />
      </TestMemoryRouter>
    </DashboardLayoutContext.Provider>
  )

describe('DashboardMenu', () => {
  it('shows a collapse button when expanded', () => {
    renderMenu(false)
    expect(screen.getByLabelText('Collapse menu')).toBeInTheDocument()
  })

  it('shows an expand button when reduced', () => {
    renderMenu(true)
    expect(screen.getByLabelText('Expand menu')).toBeInTheDocument()
  })

  it('expands the menu on logo tap for touch devices', () => {
    const onToggleReduced = vi.fn()
    mockUseMediaQuery.mockReturnValue([true])

    const { container } = renderMenu(true, onToggleReduced)
    const logoLink = container.querySelector(`a[href="${Routes.dashboard.base}"]`)
    expect(logoLink).toBeTruthy()
    fireEvent.click(logoLink as Element)
    expect(onToggleReduced).toHaveBeenCalledTimes(1)
  })
})
