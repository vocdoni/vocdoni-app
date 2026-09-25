import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { LuLayoutDashboard } from 'react-icons/lu'
import { system } from '~theme/system'
import { DashboardMenuItemButton } from './Item'

const renderItem = (reduced: boolean) =>
  render(
    <ChakraProvider value={system}>
      <DashboardMenuItemButton
        reduced={reduced}
        item={{
          label: 'Dashboard',
          icon: LuLayoutDashboard,
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
})
