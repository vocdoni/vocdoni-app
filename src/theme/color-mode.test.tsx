import { act, render, screen, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { ColorModeProvider, useColorMode, useColorModeValue, useFollowSystemColorMode } from './color-mode'

const themeProviderSpy = vi.fn()
const themeState = {
  resolvedTheme: 'dark' as string | undefined,
  forcedTheme: undefined as string | undefined,
  setTheme: vi.fn(),
}

vi.mock('next-themes', () => ({
  ThemeProvider: (props: Record<string, unknown>) => {
    themeProviderSpy(props)
    return <div data-testid='theme-provider'>{props.children as React.ReactNode}</div>
  },
  useTheme: () => themeState,
}))

const ColorModeProbe = () => <div data-testid='color-mode'>{useColorMode().colorMode}</div>

const VoterShell = () => {
  useFollowSystemColorMode()
  return null
}

const ColorModeValueProbe = () => {
  const value = useColorModeValue('light', 'dark')
  return <div data-testid='color-mode-value'>{value}</div>
}

describe('ColorModeProvider', () => {
  beforeEach(() => {
    themeState.resolvedTheme = 'dark'
    themeState.forcedTheme = undefined
    themeState.setTheme.mockReset()
  })

  it('configures next-themes with the expected storage key and defaults', () => {
    render(
      <ColorModeProvider>
        <div>child</div>
      </ColorModeProvider>
    )

    expect(themeProviderSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        attribute: 'class',
        disableTransitionOnChange: true,
        storageKey: 'theme-preference',
        defaultTheme: 'system',
        enableSystem: true,
      })
    )
  })

  it('keeps useColorModeValue hydration-safe until the component has mounted', async () => {
    themeState.resolvedTheme = undefined

    const html = renderToString(
      <ColorModeProvider>
        <ColorModeValueProbe />
      </ColorModeProvider>
    )

    const container = document.createElement('div')
    container.innerHTML = html
    document.body.appendChild(container)

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    themeState.resolvedTheme = 'dark'

    await act(async () => {
      hydrateRoot(
        container,
        <ColorModeProvider>
          <ColorModeValueProbe />
        </ColorModeProvider>
      )
    })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
    await waitFor(() => {
      expect(screen.getByTestId('color-mode-value')).toHaveTextContent('dark')
    })

    consoleErrorSpy.mockRestore()
    container.remove()
  })

  it('does not force a theme, so the OS preference reaches the app', () => {
    render(
      <ColorModeProvider>
        <ColorModeProbe />
      </ColorModeProvider>
    )

    expect(screen.getByTestId('color-mode')).toHaveTextContent('dark')
    expect(themeProviderSpy.mock.calls.at(-1)?.[0]).not.toHaveProperty('forcedTheme')
  })

  it('makes a server-rendered voter page read a key nothing writes, so a stored choice never reaches it', () => {
    localStorage.setItem('theme-preference', 'dark')
    render(
      <ColorModeProvider followSystem>
        <VoterShell />
      </ColorModeProvider>
    )

    const props = themeProviderSpy.mock.calls.at(-1)?.[0]
    expect(props).toMatchObject({ storageKey: 'theme-preference-voter', defaultTheme: 'system' })
    expect(props).not.toHaveProperty('forcedTheme')
    localStorage.removeItem('theme-preference')
  })

  it('forces the system mode while a voter shell is mounted in the client-rendered app', () => {
    const { rerender } = render(
      <ColorModeProvider>
        <VoterShell />
      </ColorModeProvider>
    )

    // The test matchMedia reports a light system.
    expect(themeProviderSpy.mock.calls.at(-1)?.[0]).toMatchObject({
      storageKey: 'theme-preference',
      forcedTheme: 'light',
    })

    rerender(
      <ColorModeProvider>
        <div />
      </ColorModeProvider>
    )
    expect(themeProviderSpy.mock.calls.at(-1)?.[0]).not.toHaveProperty('forcedTheme')
  })

  it('reports the forced mode over the stored one', () => {
    themeState.forcedTheme = 'light'
    render(
      <ColorModeProvider>
        <ColorModeProbe />
      </ColorModeProvider>
    )

    expect(screen.getByTestId('color-mode')).toHaveTextContent('light')
  })
})
