import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { system } from '~theme/system'
import { AppearanceSegment } from './ColorModeSwitcher'

const setTheme = vi.fn()

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    resolvedTheme: 'dark',
    setTheme,
  }),
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}))

const renderSegment = () =>
  render(
    <ChakraProvider value={system}>
      <AppearanceSegment />
    </ChakraProvider>
  )

describe('AppearanceSegment', () => {
  beforeEach(() => setTheme.mockReset())

  it('renders the three positions as text and marks the current theme', () => {
    renderSegment()

    expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
  })

  it('sets the theme to light when Light is picked', async () => {
    const user = userEvent.setup()
    renderSegment()

    await user.click(screen.getByText('Light'))

    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('sets the theme to system when System is picked', async () => {
    const user = userEvent.setup()
    renderSegment()

    await user.click(screen.getByText('System'))

    expect(setTheme).toHaveBeenCalledWith('system')
  })
})
