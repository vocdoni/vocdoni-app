import { ThemeProvider as NextThemeProvider, useTheme, type ThemeProviderProps } from 'next-themes'
import { useCallback, useEffect, useState } from 'react'

export type ColorMode = 'light' | 'dark'

// Fil has no dark values yet, so the app is always light. Remove `forcedTheme` (and restore the three
// ColorModeSwitcher call sites) to bring dark mode back.
export const ColorModeProvider = ({ children, ...props }: ThemeProviderProps) => (
  <NextThemeProvider
    attribute='class'
    disableTransitionOnChange
    storageKey='theme-preference'
    defaultTheme='system'
    enableSystem
    forcedTheme='light'
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
  // next-themes reports the OS theme as `resolvedTheme` even when `forcedTheme` is set, so the forced one wins.
  const { resolvedTheme, forcedTheme, setTheme } = useTheme()
  const colorMode: ColorMode = (forcedTheme ?? resolvedTheme) === 'dark' ? 'dark' : 'light'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted && colorMode === 'dark' ? dark : light
}
