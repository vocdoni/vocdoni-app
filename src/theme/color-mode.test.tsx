import { act, render, screen, waitFor } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { ColorModeProvider, useColorModeValue } from './color-mode'

const themeProviderSpy = vi.fn()
const themeState = {
  resolvedTheme: 'dark' as string | undefined,
  setTheme: vi.fn(),
}

vi.mock('next-themes', () => ({
  ThemeProvider: (props: Record<string, unknown>) => {
    themeProviderSpy(props)
    return <div data-testid='theme-provider'>{props.children as React.ReactNode}</div>
  },
  useTheme: () => themeState,
}))

const ColorModeValueProbe = () => {
  const value = useColorModeValue('light', 'dark')
  return <div data-testid='color-mode-value'>{value}</div>
}

describe('ColorModeProvider', () => {
  beforeEach(() => {
    themeState.resolvedTheme = 'dark'
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
})
