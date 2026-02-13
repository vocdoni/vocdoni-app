import { createSystem, defaultConfig } from '@chakra-ui/react'
import { recipes, slotRecipes } from './components'
import semanticTokens from './semantic'
import tokens from './tokens'

export const system = createSystem(defaultConfig, {
  theme: {
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
  },
})
