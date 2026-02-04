import { createSystem, defaultConfig } from '@chakra-ui/react'
import { colors } from './colors'
import { recipes, slotRecipes } from './components'
import { radii } from './radius'
import semanticTokens from './semantic'
import { fonts, sizes, space, zIndices } from './tokens'

export const system = createSystem(defaultConfig, {
  theme: {
    tokens: {
      colors,
      radii,
      sizes,
      spacing: space,
      zIndex: zIndices,
      fonts,
    },
    semanticTokens: {
      colors: semanticTokens.colors,
      fontWeights: semanticTokens.fontWeights,
    },
    recipes,
    slotRecipes,
  },
})
