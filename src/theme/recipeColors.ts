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

export const recipeColors = defineSemanticTokens.colors({ link })
