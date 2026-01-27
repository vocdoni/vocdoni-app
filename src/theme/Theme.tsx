import { ChakraProvider } from '@chakra-ui/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { PropsWithChildren } from 'react'
// Note these imports are dynamic aliases. Check vite.config.ts for more details
import Fonts from '~shared/Layout/Fonts'
import { rainbowStyles, system } from '~theme'
import { ColorModeProvider, useColorMode } from '~theme/color-mode'

export const Theme = ({ children }: PropsWithChildren) => {
  return (
    <ColorModeProvider>
      <ChakraProvider value={system}>
        <Fonts />
        {children}
      </ChakraProvider>
    </ColorModeProvider>
  )
}

export const RainbowKitTheme = ({ children }: PropsWithChildren) => {
  const { colorMode } = useColorMode()
  return <RainbowKitProvider theme={rainbowStyles(colorMode)}>{children}</RainbowKitProvider>
}
