import { createSystem, defaultConfig } from '@chakra-ui/react'
import { recipes, slotRecipes } from './components'
import semanticTokens from './semantic'
import tokens from './tokens'

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      colorPalette: 'gray',
    },
  },
  theme: {
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
  },
})
