import { ChakraProvider } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { useAppEnv } from '~src/app-env'
import { ColorModeProvider } from '~theme/color-mode'
import { normalizeHexColor } from '~theme/palette'
import { getAppSystem } from '~theme/system'

// One static import per file of each family in WEB_FONTS (~theme/fonts); fonts.test.ts
// fails when the two drift. Static so Vite bundles the @font-face CSS and Vike
// links it from the SSR HTML of every page that renders <Theme>.
import '@fontsource-variable/commissioner/wght.css'
import '@fontsource-variable/jetbrains-mono/wght.css'

type ThemeProps = PropsWithChildren<{
  /** A voter page, which ignores the dashboard's saved colour mode (see ColorModeProvider). */
  followSystem?: boolean
  /** A branded vote's colour (see `resolveProcessBrand`). Replaces PRIMARY_COLOR when it is a valid hex. */
  primaryColor?: string
}>

export const Theme = ({ children, followSystem, primaryColor }: ThemeProps) => {
  // The accent color is runtime config (PRIMARY_COLOR), or the organisation's on a branded vote, so the chakra
  // system is picked per render rather than imported statically. getAppSystem memoizes it.
  const { PRIMARY_COLOR } = useAppEnv()

  return (
    <ColorModeProvider followSystem={followSystem}>
      <ChakraProvider value={getAppSystem(normalizeHexColor(primaryColor) ?? PRIMARY_COLOR)}>{children}</ChakraProvider>
    </ColorModeProvider>
  )
}
