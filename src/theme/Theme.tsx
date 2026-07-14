import { ChakraProvider } from '@chakra-ui/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { PropsWithChildren, useEffect, useState } from 'react'
// Note these imports are dynamic aliases. Check vite.config.ts for more details
import { rainbowStyles } from '~theme'
import { ColorModeProvider, useColorMode } from '~theme/color-mode'
import { system } from '~theme/system'

import '@fontsource-variable/fraunces/index.css'
import '@fontsource-variable/hanken-grotesk/index.css'
import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/index.css'

export const Theme = ({ children }: PropsWithChildren) => {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>{children}</ChakraProvider>
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
