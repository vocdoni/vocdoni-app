import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { system } from '~theme/system'
import { ThemeToggleGroup } from './ColorModeSwitcher'

const setTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme,
  }),
}))

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

  it('sets theme to light when light is selected', async () => {
    const user = userEvent.setup()

    render(
      <ChakraProvider value={system}>
        <ThemeToggleGroup />
      </ChakraProvider>
    )

    await user.click(screen.getByRole('button', { name: 'Light' }))

    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('sets theme to system when system is selected', async () => {
    const user = userEvent.setup()

    render(
      <ChakraProvider value={system}>
        <ThemeToggleGroup />
      </ChakraProvider>
    )

    await user.click(screen.getByRole('button', { name: 'System' }))

    expect(setTheme).toHaveBeenCalledWith('system')
  })
})
