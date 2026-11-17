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
      value: '{colors.accent.fg}',
    },
    hover: {
      value: '{colors.accent.fg.hover}',
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
        _dark: '{colors.carbon.300}',
      },
    },
    checked: {
      value: {
        _light: '{colors.colorPalette.contrast}',
        _dark: '{colors.white}',
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

// Solid toast fills and their text. Chakra's green.600 and orange.600 leave white text at 3.30 and 3.56; these reach
// 6.8 and 7.9. Dark mode keeps orange.500 under black text (7.49). The text is the status contrast colour, as in stock.
const toast = {
  // Dark mode: Fil's live green under near-black text (7.3), as the guide pairs them.
  success: {
    bg: { value: { _light: '{colors.success.700}', _dark: '{colors.success.solid}' } },
    fg: { value: '{colors.success.contrast}' },
  },
  warning: {
    bg: { value: { _light: '{colors.warning.700}', _dark: '{colors.warning.500}' } },
    fg: { value: '{colors.warning.contrast}' },
  },
}

export const recipeColors = defineSemanticTokens.colors({ link, switch: switchColors, progress, toast })
