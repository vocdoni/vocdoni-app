import { createSystem, defaultConfig } from '@chakra-ui/react'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import tokens from './tokens'

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      colorPalette: 'teal',
    },
  },
  theme: {
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
  },
})
