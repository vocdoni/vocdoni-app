import { ChakraProvider } from '@chakra-ui/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useAppEnv } from '~src/app-env'
// Note these imports are dynamic aliases. Check vite.config.ts for more details
import { rainbowStyles } from '~theme'
import { ColorModeProvider, useColorMode } from '~theme/color-mode'
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

export const RainbowKitTheme = ({ children }: PropsWithChildren) => {
  const { colorMode } = useColorMode()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const rainbowKitColorMode = mounted ? colorMode : 'light'

  return (
    <RainbowKitProvider key={rainbowKitColorMode} theme={rainbowStyles(rainbowKitColorMode)}>
      {children}
    </RainbowKitProvider>
  )
}
