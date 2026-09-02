import { ChakraProvider } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { useAppEnv } from '~src/app-env'
import { ColorModeProvider } from '~theme/color-mode'
import { getAppSystem } from '~theme/system'

import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/index.css'

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
