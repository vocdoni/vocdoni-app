import { Route, Routes } from 'react-router'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { RoutedTabs } from './RoutedTabs'

const tabs = [
  { label: 'First', route: 'first' },
  { label: 'Second', route: 'second' },
]

describe('RoutedTabs', () => {
  it('renders the routed content in the panel the selected tab controls', () => {
    // zag re-syncs the panel's tabindex after paint (needs real layout); freeze that to observe what we render.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 0)
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
    // The panel is not a keyboard stop of its own: its content is, as before.
    expect(panel).toHaveAttribute('tabindex', '-1')
  })
})
