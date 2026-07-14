import { createSystem, defaultConfig } from '@chakra-ui/react'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import tokens from './tokens'

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      colorPalette: 'gray',
      // Warm editorial experiment: real values for the previously-undefined shadow vars
      '--box-shadow': '0px 1px 2px 0px rgb(0 0 0 / 0.08)',
      '--box-shadow-banner':
        '0px 12px 32px -8px oklch(0.24 0.013 106 / 0.16), 0px 2px 6px -2px oklch(0.24 0.013 106 / 0.08)',
      '--box-shadow-dark-mode': '0px 1px 2px 0px rgb(0 0 0 / 0.25)',
    },
    body: {
      bg: 'chakra.body.bg',
      color: 'texts.primary',
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      textRendering: 'optimizeLegibility',
    },
  },
  theme: {
    tokens,
    semanticTokens,
    recipes,
    slotRecipes,
  },
})
