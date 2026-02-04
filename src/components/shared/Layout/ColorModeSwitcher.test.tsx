import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { system } from '~theme/system'
import { ThemeToggleGroup } from './ColorModeSwitcher'

const setColorMode = vi.fn()

vi.mock('~theme/color-mode', () => ({
  useColorMode: () => ({
    setColorMode,
  }),
  useColorModeValue: (light: string, _dark: string) => light,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}))

describe('ThemeToggleGroup', () => {
  it('renders theme toggle buttons', () => {
    render(
      <ChakraProvider value={system}>
        <ThemeToggleGroup />
      </ChakraProvider>
    )

    expect(screen.getByRole('button', { name: 'System' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Light' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Dark' })).toBeInTheDocument()
  })
})
