import { ThemeProvider as NextThemeProvider, useTheme, type ThemeProviderProps } from 'next-themes'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from 'react'
import { COLOR_MODE_STORAGE_KEY, VOTER_COLOR_MODE_STORAGE_KEY } from './color-mode-script'

export type ColorMode = 'light' | 'dark'

const SYSTEM_DARK = '(prefers-color-scheme: dark)'

const subscribeToSystem = (onChange: () => void) => {
  const query = window.matchMedia(SYSTEM_DARK)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

// The system's mode, live; unknown on the server.
const useSystemColorMode = (): ColorMode | undefined =>
  useSyncExternalStore(
    subscribeToSystem,
    () => (window.matchMedia(SYSTEM_DARK).matches ? 'dark' : 'light'),
    () => undefined
  )

// Registers a mounted voter shell with the provider; absent when the provider already follows the system.
const VoterShellContext = createContext<((delta: number) => void) | undefined>(undefined)

type ColorModeProviderProps = ThemeProviderProps & {
  // Voter pages rendered on the server: they read a key nothing writes, so next-themes' own pre-paint script and the
  // provider follow the system and never the dashboard's saved choice.
  followSystem?: boolean
}

// Default is the system; the dashboard's Appearance control saves a choice on the device. The class and
// `color-scheme` are set before paint by +headHtmlBegin on every page, and again by next-themes' script on SSR pages.
export const ColorModeProvider = ({ children, followSystem = false, ...props }: ColorModeProviderProps) => {
  const [voterShells, setVoterShells] = useState(0)
  const register = useCallback((delta: number) => setVoterShells((count) => count + delta), [])
  const systemMode = useSystemColorMode()
  // A voter shell inside the client-rendered app (a client-side visit to an organisation page, the shared-census
  // home) forces the system's mode, since the stored choice was already read at mount.
  const forcedTheme = !followSystem && voterShells > 0 ? systemMode : undefined

  return (
    <VoterShellContext.Provider value={followSystem ? undefined : register}>
      <NextThemeProvider
        attribute='class'
        disableTransitionOnChange
        storageKey={followSystem ? VOTER_COLOR_MODE_STORAGE_KEY : COLOR_MODE_STORAGE_KEY}
        defaultTheme='system'
        enableSystem
        {...(forcedTheme ? { forcedTheme } : {})}
        {...props}
      >
        {children}
      </NextThemeProvider>
    </VoterShellContext.Provider>
  )
}

// Called by the voter shell (PublicLayout): while it is mounted the page follows the system.
export const useFollowSystemColorMode = () => {
  const register = useContext(VoterShellContext)
  // Layout effect, so the forced mode lands before the browser paints the shell.
  useLayoutEffect(() => {
    if (!register) return
    register(1)
    return () => register(-1)
  }, [register])
}

export const useColorMode = (): {
  colorMode: ColorMode
  toggleColorMode: () => void
  setColorMode: (value: ColorMode) => void
} => {
  const { resolvedTheme, forcedTheme, setTheme } = useTheme()
  // next-themes keeps reporting the stored choice as resolvedTheme while a mode is forced.
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
