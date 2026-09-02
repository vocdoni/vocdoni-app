import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppEnvProvider } from '~src/app-env'
import { buildAppEnv } from '~src/app-env-build'
import { Theme } from './Theme'

const themeState = {
  resolvedTheme: undefined as string | undefined,
  setTheme: vi.fn(),
}

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTheme: () => themeState,
}))

describe('Theme', () => {
  beforeEach(() => {
    themeState.resolvedTheme = undefined
    themeState.setTheme.mockReset()
    document.documentElement.className = ''
    document.documentElement.style.colorScheme = ''
  })

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
