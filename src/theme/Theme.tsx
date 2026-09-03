import { ChakraProvider } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'

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
