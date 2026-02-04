import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'
import { ListStateAlert } from './ListStateAlert'

const matchMediaMock = (query: string) => {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  }
}

describe('ListStateAlert', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    })
  })

  it('renders title and description when show is true', () => {
    render(
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <ListStateAlert show status='info' title='No items found' description='Try again later' />
        </ColorModeProvider>
      </ChakraProvider>
    )

    expect(screen.getByText('No items found')).toBeInTheDocument()
    expect(screen.getByText('Try again later')).toBeInTheDocument()
  })

  it('returns null when show is false', () => {
    render(
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <ListStateAlert show={false} status='info' title='Hidden' description='Hidden description' />
        </ColorModeProvider>
      </ChakraProvider>
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
