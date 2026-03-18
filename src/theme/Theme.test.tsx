import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { RainbowKitTheme } from './Theme'

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
