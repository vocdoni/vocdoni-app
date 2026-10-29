import { defineSemanticTokens } from '@chakra-ui/react'

// Colours of the public ballot (react-components slots and the election recipes), so a theme can restyle the
// voting page from one place.
export const ballotColors = defineSemanticTokens.colors({
  ballot: {
    choice: {
      // Unselected states only: a selected choice reads `colorPalette.solid`, like Chakra's checkbox, so it
      // follows the brand.
      border: {
        value: {
          _light: '{colors.gray.200}',
          _dark: '{colors.ink.700}',
        },
      },
      // Circle and fill of the single-choice radio.
      ring: {
        value: {
          _light: '{colors.border}',
          _dark: '{colors.gray.500}',
        },
      },
      bg: {
        value: {
          _light: '{colors.white}',
          _dark: '{colors.gray.800}',
        },
      },
    },
    results: {
      track: {
        value: {
          _light: '{colors.gray.100}',
          _dark: '{colors.gray.800}',
        },
      },
    },
    schedule: {
      value: '{colors.gray.400}',
    },
    error: {
      value: '{colors.red.500}',
    },
    balance: {
      success: {
        value: '{colors.green.500}',
      },
      warning: {
        value: '{colors.orange.500}',
      },
      error: {
        value: '{colors.red.500}',
      },
    },
  },
})
