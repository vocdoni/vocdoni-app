import { Route, Routes } from 'react-router'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { RoutedTabs } from './RoutedTabs'

const tabs = [
  { label: 'First', route: 'first' },
  { label: 'Second', route: 'second' },
]

describe('RoutedTabs', () => {
  it('renders the routed content in the panel the selected tab controls', () => {
    render(
      <TestMemoryRouter initialEntries={['/admin/second']}>
        <Routes>
          <Route path='/admin' element={<RoutedTabs tabs={tabs} />}>
            <Route path='first' element={<p>First content</p>} />
            <Route path='second' element={<p>Second content</p>} />
          </Route>
        </Routes>
      </TestMemoryRouter>
    )

    const tab = screen.getByRole('tab', { name: 'Second', selected: true })
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '')
    expect(panel).not.toBeNull()
    expect(panel).toContainElement(screen.getByText('Second content'))
  })
})
