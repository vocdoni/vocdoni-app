import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChakraProvider } from '@chakra-ui/react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme'
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
