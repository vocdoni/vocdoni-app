import { ChakraProvider } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { useAppEnv } from '~src/app-env'
import { ColorModeProvider } from '~theme/color-mode'
import { getAppSystem } from '~theme/system'

// One static import per weight in LOADED_FONT_WEIGHTS (~theme/fonts); fonts.test.ts
// fails when the two drift. Static so Vite bundles the @font-face CSS and Vike
// links it from the SSR HTML of every page that renders <Theme>.
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'

export const Theme = ({ children }: PropsWithChildren) => {
  // The accent color is runtime config (PRIMARY_COLOR), so the chakra system is
  // picked per env rather than imported statically. getAppSystem memoizes it.
  const { PRIMARY_COLOR } = useAppEnv()

  return (
    <ColorModeProvider>
      <ChakraProvider value={getAppSystem(PRIMARY_COLOR)}>{children}</ChakraProvider>
    </ColorModeProvider>
  )
}
