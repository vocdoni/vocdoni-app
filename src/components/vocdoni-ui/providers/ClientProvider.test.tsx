import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'
import { ClientProvider } from './ClientProvider'

describe('ClientProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ColorModeProvider>
        <ChakraProvider value={system}>
          <ClientProvider env='stg'>
            <span>ok</span>
          </ClientProvider>
        </ChakraProvider>
      </ColorModeProvider>
    )
    expect(getByText('ok')).toBeTruthy()
  })
})
