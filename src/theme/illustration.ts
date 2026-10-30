import { defineSemanticTokens } from '@chakra-ui/react'

// Artwork colours, read as `currentColor` by the SVGs so each mode is picked in CSS and the
// server-rendered first paint already matches the visitor's mode.
export const illustrationColors = defineSemanticTokens.colors({
  // BallotBoxAnimated: the box, ballot and tick, and the cut-outs drawn on top of them.
  illustration: {
    fg: {
      value: '#4D4D4D',
    },
    contrast: {
      value: '{colors.white}',
    },
  },
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
