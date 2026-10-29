import { defineSemanticTokens } from '@chakra-ui/react'

// Read by the link recipe and the rich-text editor, so both stay in step.
const link = {
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

// Border of a secondary action sitting on a card. Same grey in both color modes.
const control = {
  border: {
    value: '{colors.gray.300}',
  },
}

export const recipeColors = defineSemanticTokens.colors({ link, control })
