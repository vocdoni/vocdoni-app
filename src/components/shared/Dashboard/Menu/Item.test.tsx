import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { LuLayoutDashboard } from 'react-icons/lu'
import { system } from '~theme/system'
import { DashboardMenuItemButton } from './Item'

describe('DashboardMenuItemButton', () => {
  it('renders the button when reduced', () => {
    render(
      <ChakraProvider value={system}>
        <DashboardMenuItemButton
          reduced
          item={{
            label: 'Dashboard',
            icon: LuLayoutDashboard,
          }}
        />
      </ChakraProvider>
    )

    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
