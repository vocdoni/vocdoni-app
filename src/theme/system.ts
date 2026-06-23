import { createSystem, defaultConfig, type SystemStyleObject } from '@chakra-ui/react'
import layerStyles from './layerStyles'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import textStyles from './textStyles'
import tokens from './tokens'

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      colorPalette: 'gray',
    },
    // Crisper text rendering, especially on macOS. Cast: these vendor-prefixed
    // properties aren't in csstype but are valid CSS passed through by Emotion.
    'html, body': {
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    } as SystemStyleObject,
    // Avoid orphans/awkward breaks in body copy. Headings use `balance` via the
    // heading recipe (see recipes/typography.ts).
    body: {
      textWrap: 'pretty',
    },
  },
  theme: {
    tokens,
    semanticTokens,
    textStyles,
    layerStyles,
    recipes,
    slotRecipes,
  },
})
