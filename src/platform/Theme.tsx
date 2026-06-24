import { ChakraProvider } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { ColorModeProvider } from '~theme/color-mode'
import { system } from '~theme/system'

import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/index.css'

// Thin theme wrapper for the platform SPA. It reuses vocdoni-app's Chakra design system
// (~theme/system) and color mode so the integrator UX looks like the end-user app, but it
// deliberately does NOT import bare `~theme` (which re-exports rainbowStyles → RainbowKit) or
// `~theme/Theme` (which pulls RainbowKitTheme). Keeping the platform bundle free of Web3 deps.
export const Theme = ({ children }: PropsWithChildren) => (
  <ColorModeProvider>
    <ChakraProvider value={system}>{children}</ChakraProvider>
  </ColorModeProvider>
)
