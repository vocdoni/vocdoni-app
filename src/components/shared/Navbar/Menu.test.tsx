import { ChakraProvider, MenuPositioner, MenuRoot } from '@chakra-ui/react'
import { act, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { system } from '~theme'
import MenuDropdown from './Menu'

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({ account: null, clear: vi.fn() }),
}))

vi.mock('wagmi', () => ({
  useDisconnect: () => ({ disconnect: vi.fn() }),
}))

describe('MenuDropdown', () => {
  it('renders the documentation link', async () => {
    await act(async () => {
      render(
        <ChakraProvider value={system}>
          <MenuRoot open>
            <MenuPositioner>
              <MenuDropdown />
            </MenuPositioner>
          </MenuRoot>
        </ChakraProvider>
      )
    })

    expect(await screen.findByText('menu.documentation')).toBeInTheDocument()
  })
})
