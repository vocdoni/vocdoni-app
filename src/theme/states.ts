import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * Interaction states of a surface, each as a bg/fg pair. They are fixed greys
 * rather than `colorPalette` steps: a global semantic token cannot read the
 * palette of the element it lands on.
 */
export const stateColors = defineSemanticTokens.colors({
  state: {
    hover: {
      // Translucent so it shows on white and on the sidebar tint alike (it is the only keyboard highlight in menus).
      bg: { value: { _light: 'rgb(0 0 0 / 0.04)', _dark: '{colors.bg.muted}' } },
      fg: { value: { _light: '{colors.gray.900}', _dark: '{colors.white}' } },
    },
    pressed: {
      bg: { value: '{colors.bg.emphasized}' },
      fg: { value: '{colors.fg}' },
    },
    selected: {
      bg: { value: { _light: 'rgb(0 0 0 / 0.06)', _dark: 'rgb(255 255 255 / 0.1)' } },
      fg: { value: { _light: '{colors.gray.900}', _dark: '{colors.white}' } },
    },
    current: {
      bg: { value: { _light: 'rgb(0 0 0 / 0.06)', _dark: '{colors.bg.emphasized}' } },
      fg: { value: '{colors.fg}' },
    },
    // A file dragged over a drop target
    dragover: {
      border: { value: '{colors.accent.solid}' },
    },
  },
})
