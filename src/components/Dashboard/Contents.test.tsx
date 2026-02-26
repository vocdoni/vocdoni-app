import { Outlet, Route, Routes } from 'react-router-dom'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { DashboardContents } from './Contents'

describe('DashboardContents', () => {
  const renderWithReduced = (reduced: boolean) =>
    render(
      <TestMemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Outlet context={{ reduced }} />}>
            <Route path='/' element={<DashboardContents data-testid='contents' />} />
          </Route>
        </Routes>
      </TestMemoryRouter>
    )

  it('uses default max width when not reduced', () => {
    renderWithReduced(false)
    expect(screen.getByTestId('contents')).toHaveStyle({
      maxWidth: 'var(--chakra-sizes-dashboard-content-default)',
    })
  })

  it('uses reduced max width when reduced', () => {
    renderWithReduced(true)
    expect(screen.getByTestId('contents')).toHaveStyle({
      maxWidth: 'var(--chakra-sizes-dashboard-content-reduced)',
    })
  })
})
