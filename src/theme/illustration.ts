import { defineSemanticTokens } from '@chakra-ui/react'

// The logo's colour, read as `currentColor` by the SVG so each mode is picked in CSS and the server-rendered first
// paint already matches the visitor's mode.
export const illustrationColors = defineSemanticTokens.colors({
  logo: {
    // Pure black (`ink.950`), not chakra's `black`, which is #09090B.
    fg: {
      value: {
        _light: '{colors.ink.950}',
        _dark: '{colors.white}',
      },
    },
  },
})
