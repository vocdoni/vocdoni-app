import { ThemeProvider as NextThemeProvider, useTheme, type ThemeProviderProps } from 'next-themes'
import { useCallback } from 'react'

export type ColorMode = 'light' | 'dark'

export const ColorModeProvider = ({ children, ...props }: ThemeProviderProps) => (
  <NextThemeProvider
    attribute='class'
    disableTransitionOnChange
    storageKey='theme-preference'
    defaultTheme='system'
    enableSystem
    {...props}
  >
    {children}
  </NextThemeProvider>
)

export const useColorMode = (): {
  colorMode: ColorMode
  toggleColorMode: () => void
  setColorMode: (value: ColorMode) => void
} => {
  const { resolvedTheme, setTheme } = useTheme()
  const colorMode: ColorMode = resolvedTheme === 'dark' ? 'dark' : 'light'

  const toggleColorMode = useCallback(() => {
    setTheme(colorMode === 'dark' ? 'light' : 'dark')
  }, [colorMode, setTheme])

  const setColorMode = useCallback(
    (value: ColorMode) => {
      setTheme(value)
    },
    [setTheme]
  )

  return { colorMode, toggleColorMode, setColorMode }
}

export const useColorModeValue = <T,>(light: T, dark: T) => {
  const { colorMode } = useColorMode()
  return colorMode === 'dark' ? dark : light
}
