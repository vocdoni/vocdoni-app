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

  it("renders the title and the error's own message", () => {
    render(
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <ListStateAlert error={new Error('Try again later')} title='Unable to load items' fallback='Fallback' />
        </ColorModeProvider>
      </ChakraProvider>
    )

    expect(screen.getByText('Unable to load items')).toBeInTheDocument()
    expect(screen.getByText('Try again later')).toBeInTheDocument()
    expect(screen.queryByText('Fallback')).not.toBeInTheDocument()
  })

  it('falls back to the given description when the error carries no message', () => {
    render(
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <ListStateAlert error='failed' title='Unable to load items' fallback='Please try again.' />
        </ColorModeProvider>
      </ChakraProvider>
    )

    expect(screen.getByText('Please try again.')).toBeInTheDocument()
  })

  it('returns null when show is false', () => {
    render(
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <ListStateAlert show={false} error={new Error('Hidden description')} title='Hidden' />
        </ColorModeProvider>
      </ChakraProvider>
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
