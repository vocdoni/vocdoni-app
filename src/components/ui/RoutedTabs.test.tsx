import { useState } from 'react'
import { Route, Routes } from 'react-router'
import { act, fireEvent, render, screen, TestMemoryRouter } from '~src/test-utils'
import { RoutedTabs } from './RoutedTabs'

const tabs = [
  { label: 'First', route: 'first' },
  { label: 'Second', route: 'second' },
]

describe('RoutedTabs', () => {
  it('renders the routed content in the panel the selected tab controls', async () => {
    // TabsRoot updates its state just after mount; render inside act so that update lands here.
    await act(async () =>
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
    )

    const tab = screen.getByRole('tab', { name: 'Second', selected: true })
    const panel = document.getElementById(tab.getAttribute('aria-controls') ?? '')
    expect(panel).not.toBeNull()
    expect(panel).toContainElement(screen.getByText('Second content'))
  })

  it('keeps the tab mounted, with its state, when the notice comes and goes', async () => {
    const Counter = () => {
      const [clicks, setClicks] = useState(0)
      return <button onClick={() => setClicks((value) => value + 1)}>{`Clicked ${clicks}`}</button>
    }
    const Page = () => {
      const [notice, setNotice] = useState(false)
      return (
        <>
          <button onClick={() => setNotice((value) => !value)}>Toggle notice</button>
          <RoutedTabs tabs={tabs} notice={notice ? <p>Paused</p> : undefined} />
        </>
      )
    }
    await act(async () =>
      render(
        <TestMemoryRouter initialEntries={['/admin/first']}>
          <Routes>
            <Route path='/admin' element={<Page />}>
              <Route path='first' element={<Counter />} />
            </Route>
          </Routes>
        </TestMemoryRouter>
      )
    )

    fireEvent.click(screen.getByRole('button', { name: 'Clicked 0' }))
    fireEvent.click(screen.getByRole('button', { name: 'Toggle notice' }))
    expect(screen.getByText('Paused')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Toggle notice' }))

    expect(screen.getByRole('button', { name: 'Clicked 1' })).toBeInTheDocument()
  })
})
