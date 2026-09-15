import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppEnvProvider } from '~src/app-env'
import { buildAppEnv } from '~src/app-env-build'
import { RainbowKitTheme, Theme } from './Theme'

const themeState = {
  resolvedTheme: undefined as string | undefined,
  setTheme: vi.fn(),
}

const rainbowStylesSpy = vi.fn((colorMode: 'light' | 'dark') => ({ colorMode }))
const rainbowKitProviderSpy = vi.fn()

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTheme: () => themeState,
}))

vi.mock('@rainbow-me/rainbowkit', () => ({
  RainbowKitProvider: ({ children, theme }: { children: ReactNode; theme: unknown }) => {
    rainbowKitProviderSpy(theme)
    return <div data-testid='rainbow-kit-provider'>{children}</div>
  },
}))

vi.mock('~theme', () => ({
  rainbowStyles: (colorMode: 'light' | 'dark') => rainbowStylesSpy(colorMode),
}))

describe('RainbowKitTheme', () => {
  beforeEach(() => {
    themeState.resolvedTheme = undefined
    themeState.setTheme.mockReset()
    rainbowStylesSpy.mockClear()
    rainbowKitProviderSpy.mockClear()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
  })

  it('keeps the first render hydration-safe even if the document is already dark', () => {
    document.documentElement.classList.add('dark')

    const rendered = render(
      <RainbowKitTheme>
        <div>child</div>
      </RainbowKitTheme>
    )

    expect(screen.getByTestId('rainbow-kit-provider')).toBeInTheDocument()
    expect(rainbowStylesSpy).toHaveBeenNthCalledWith(1, 'light')
    expect(rainbowKitProviderSpy).toHaveBeenNthCalledWith(1, { colorMode: 'light' })

    themeState.resolvedTheme = 'dark'
    rendered.rerender(
      <RainbowKitTheme>
        <div>child</div>
      </RainbowKitTheme>
    )

    expect(rainbowStylesSpy).toHaveBeenLastCalledWith('dark')
    expect(rainbowKitProviderSpy).toHaveBeenLastCalledWith({ colorMode: 'dark' })
  })
})

describe('Theme', () => {
  // Chakra emits its token CSS variables through emotion; jsdom keeps them in
  // <style> tags (text or cssRules depending on insertion mode), so look in both.
  const injectedCss = () =>
    Array.from(document.head.querySelectorAll('style'))
      .map((style) => {
        const rules = style.sheet ? Array.from(style.sheet.cssRules).map((rule) => rule.cssText) : []
        return [style.textContent ?? '', ...rules].join('\n')
      })
      .join('\n')

  const renderWithEnv = (env: Record<string, string | undefined>) =>
    render(
      <AppEnvProvider value={buildAppEnv(env)}>
        <Theme>
          <div>child</div>
        </Theme>
      </AppEnvProvider>
    )

  it('builds the chakra system from PRIMARY_COLOR', () => {
    renderWithEnv({ PRIMARY_COLOR: '#1a73e8' })

    expect(screen.getByText('child')).toBeInTheDocument()
    const css = injectedCss()
    expect(css).toMatch(/--chakra-colors-brand-500:\s*#1a73e8/)
    expect(css).toMatch(/--chakra-colors-color-palette-solid:\s*var\(--chakra-colors-brand-solid\)/)
  })

  it('keeps the stock black brand and gray palette without PRIMARY_COLOR', () => {
    renderWithEnv({})

    const css = injectedCss()
    expect(css).toMatch(/--chakra-colors-brand-500:\s*#000000/)
    expect(css).toMatch(/--chakra-colors-color-palette-solid:\s*var\(--chakra-colors-gray-solid\)/)
  })
})
