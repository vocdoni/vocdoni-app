import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * Interaction states of a surface, each as a bg/fg pair. They are fixed greys
 * rather than `colorPalette` steps: a global semantic token cannot read the
 * palette of the element it lands on.
 */
export const stateColors = defineSemanticTokens.colors({
  state: {
    hover: {
      bg: { value: '{colors.bg.muted}' },
      fg: { value: { _light: '{colors.black}', _dark: '{colors.white}' } },
    },
    pressed: {
      bg: { value: '{colors.bg.emphasized}' },
      fg: { value: '{colors.fg}' },
    },
    selected: {
      bg: { value: { _light: '{colors.gray.100}', _dark: '{colors.ink.700}' } },
      fg: { value: { _light: '{colors.black}', _dark: '{colors.white}' } },
    },
    current: {
      bg: { value: '{colors.bg.emphasized}' },
      fg: { value: '{colors.fg}' },
    },
    // A file dragged over a drop target
    dragover: {
      border: { value: '{colors.green.400}' },
    },
  },
})
