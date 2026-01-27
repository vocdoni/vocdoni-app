import { render } from '@testing-library/react'
import { ColorModeProvider } from './color-mode'

const themeProviderSpy = vi.fn()

vi.mock('next-themes', () => ({
  ThemeProvider: (props: Record<string, unknown>) => {
    themeProviderSpy(props)
    return <div data-testid='theme-provider'>{props.children as React.ReactNode}</div>
  },
  useTheme: () => ({
    resolvedTheme: 'dark',
    setTheme: vi.fn(),
  }),
}))

describe('ColorModeProvider', () => {
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
})
