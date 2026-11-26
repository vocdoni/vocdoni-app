import { ChakraProvider } from '@chakra-ui/react'
import { act, render, screen } from '@testing-library/react'
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

// The segment's zag machine starts in a microtask after mount; flush it inside act.
const renderSegment = () =>
  act(async () => {
    render(
      <ChakraProvider value={system}>
        <AppearanceSegment />
      </ChakraProvider>
    )
  })

describe('AppearanceSegment', () => {
  beforeEach(() => setTheme.mockReset())

  it('renders the three positions as text and marks the current theme', async () => {
    await renderSegment()

    expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
  })

  it('sets the theme to light when Light is picked', async () => {
    const user = userEvent.setup()
    await renderSegment()

    await user.click(screen.getByText('Light'))

    expect(setTheme).toHaveBeenCalledWith('light')
  })

  it('sets the theme to system when System is picked', async () => {
    const user = userEvent.setup()
    await renderSegment()

    await user.click(screen.getByText('System'))

    expect(setTheme).toHaveBeenCalledWith('system')
  })
})
