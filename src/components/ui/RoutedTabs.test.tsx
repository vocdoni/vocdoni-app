import { Route, Routes } from 'react-router'
import { act, render, screen, TestMemoryRouter } from '~src/test-utils'
import { RoutedTabs } from './RoutedTabs'

const tabs = [
  { label: 'First', route: 'first' },
  { label: 'Second', route: 'second' },
]

describe('RoutedTabs', () => {
  it('renders the routed content in the panel the selected tab controls', async () => {
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

    // TabsRoot updates its state just after mount; flush that update inside act
    const tab = screen.getByRole('tab', { name: 'Second', selected: true })
    await act(async () => {})
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '')
    expect(panel).not.toBeNull()
    expect(panel).toContainElement(screen.getByText('Second content'))
  })
})
