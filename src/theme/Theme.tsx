import { ChakraProvider } from '@chakra-ui/react'
import { PropsWithChildren, useEffect } from 'react'
import { useAppEnv } from '~src/app-env'
import { ColorModeProvider } from '~theme/color-mode'
import { getAppSystem } from '~theme/system'

// One static import per weight in LOADED_FONT_WEIGHTS (~theme/fonts); fonts.test.ts
// fails when the two drift. Latin only: these are the files the page preloads, and
// lazyFonts declares the other subsets after hydration (see below).
import '@fontsource/inter/latin-300.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'

export const Theme = ({ children }: PropsWithChildren) => {
  // The accent color is runtime config (PRIMARY_COLOR), so the chakra system is
  // picked per env rather than imported statically. getAppSystem memoizes it.
  const { PRIMARY_COLOR } = useAppEnv()

  // Off the critical path; the faces download only when a glyph needs them. A failed chunk load just keeps the
  // fallback font, so it must not surface as an unhandled rejection.
  useEffect(() => {
    import('./lazyFonts').then(({ loadInterSubsets }) => loadInterSubsets()).catch(() => undefined)
  }, [])

  return (
    <ColorModeProvider>
      <ChakraProvider value={getAppSystem(PRIMARY_COLOR)}>{children}</ChakraProvider>
    </ColorModeProvider>
  )
}
