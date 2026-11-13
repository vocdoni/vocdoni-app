import { ChakraProvider } from '@chakra-ui/react'
import { fireEvent, render, screen } from '@testing-library/react'
import { DashboardIcon } from '~theme/icons'
import { MemoryRouter } from 'react-router'
import { RoutePrefetchProvider } from '~src/router/route-prefetch'
import { system } from '~theme/system'
import { DashboardMenuItemButton } from './Item'

const renderItem = (reduced: boolean) =>
  render(
    <ChakraProvider value={system}>
      <DashboardMenuItemButton
        reduced={reduced}
        item={{
          label: 'Dashboard',
          icon: DashboardIcon,
        }}
      />
    </ChakraProvider>
  )

describe('DashboardMenuItemButton', () => {
  it('shows the label inline when expanded', () => {
    renderItem(false)

    expect(screen.getByRole('button')).toHaveTextContent('Dashboard')
  })

  // The reduced sidebar is icon-only: the label moves to a tooltip.
  it('drops the inline label when reduced', () => {
    renderItem(true)

    expect(screen.getByRole('button')).not.toHaveTextContent('Dashboard')
  })

  it.each([false, true])('starts loading the section code on hover and on focus (reduced: %s)', (reduced) => {
    const sectionCode = vi.fn(async () => ({ Component: () => null }))
    render(
      <ChakraProvider value={system}>
        <MemoryRouter>
          <RoutePrefetchProvider routes={[{ path: '/admin/processes', lazy: sectionCode }]}>
            <DashboardMenuItemButton
              reduced={reduced}
              item={{ label: 'Votes', icon: DashboardIcon, route: '/admin/processes' }}
            />
          </RoutePrefetchProvider>
        </MemoryRouter>
      </ChakraProvider>
    )

    fireEvent.mouseEnter(screen.getByRole('link'))
    expect(sectionCode).toHaveBeenCalledTimes(1)

    fireEvent.focus(screen.getByRole('link'))
    expect(sectionCode).toHaveBeenCalledTimes(2)
  })
})
