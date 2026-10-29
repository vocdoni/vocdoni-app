import { defineSemanticTokens } from '@chakra-ui/react'

// Colours of the public ballot (react-components slots and the election recipes), so a theme can restyle the
// voting page from one place.
export const ballotColors = defineSemanticTokens.colors({
  ballot: {
    choice: {
      // Outline of a choice card.
      border: {
        DEFAULT: {
          value: {
            _light: '{colors.gray.200}',
            _dark: '{colors.ink.700}',
          },
        },
        checked: {
          value: {
            _light: '{colors.black}',
            _dark: '{colors.white}',
          },
        },
      },
      // The single-choice radio: its circle, its fill and the dot of the selected choice.
      ring: {
        DEFAULT: {
          value: {
            _light: '{colors.border}',
            _dark: '{colors.gray.500}',
          },
        },
        checked: {
          value: {
            _light: '{colors.gray.700}',
            _dark: '{colors.gray.100}',
          },
        },
      },
      bg: {
        value: {
          _light: '{colors.white}',
          _dark: '{colors.gray.800}',
        },
      },
      dot: {
        value: {
          _light: '{colors.gray.900}',
          _dark: '{colors.gray.100}',
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
      range: {
        value: {
          _light: '{colors.gray.400}',
          _dark: '{colors.gray.500}',
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
