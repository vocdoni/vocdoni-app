import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChakraProvider } from '@chakra-ui/react'
import { ClientProvider } from './ClientProvider'

describe('ClientProvider', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ChakraProvider>
        <ClientProvider env='stg'>
          <span>ok</span>
        </ClientProvider>
      </ChakraProvider>
    )
    expect(getByText('ok')).toBeTruthy()
  })
})
