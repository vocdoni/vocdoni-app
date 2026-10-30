import { defineSemanticTokens } from '@chakra-ui/react'

// Read by the link recipe and the rich-text editor, so both stay in step.
const link = {
  tile: {
    hover: {
      bg: { value: '{colors.gray.500}' },
    },
  },
  fg: {
    DEFAULT: {
      value: {
        _light: '{colors.gray.800}',
        _dark: '{colors.gray.400}',
      },
    },
    hover: {
      value: {
        _light: '{colors.gray.500}',
        _dark: '{colors.gray.200}',
      },
    },
  },
}

// The switch thumb, off and on. `checked` reads the page's palette, not the switch's: a token is resolved where
// it is defined, so a switch with its own `colorPalette` would still get the page's contrast colour.
const switchColors = {
  thumb: {
    DEFAULT: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.gray.600}',
      },
    },
    checked: {
      value: {
        _light: '{colors.colorPalette.contrast}',
        _dark: '{colors.gray.600}',
      },
    },
  },
}

// The stripes on a turnout bar: Chakra's `striped` values, light on the light page and dark on the dark one.
const progress = {
  stripe: {
    value: {
      _light: '{colors.white/30}',
      _dark: '{colors.ink.950/30}',
    },
  },
}

export const recipeColors = defineSemanticTokens.colors({ link, switch: switchColors, progress })
