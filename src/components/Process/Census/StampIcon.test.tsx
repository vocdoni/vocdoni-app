import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { system } from '~theme/system'
import { StampIcon } from './StampIcon'

describe('StampIcon', () => {
  it('renders the stamp image', () => {
    render(
      <ChakraProvider value={system}>
        <StampIcon iconURI='https://example.com/icon.png' alt='Stamp icon' tooltip='Stamp tooltip' />
      </ChakraProvider>
    )

    expect(screen.getByAltText('Stamp icon')).toBeInTheDocument()
  })
})
