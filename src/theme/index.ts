import { createSystem, defaultConfig } from '@chakra-ui/react'
import { darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { recipes, slotRecipes } from './components'
import semanticTokens from './semantic'
import { fonts, sizes, space, zIndices } from './tokens'

import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/index.css'

const colors = {
  black: {
    // comments refer to button styles
    50: { value: '#e5e5e5' }, // ghost hover (light)
    100: { value: '#cccccc' }, // hover (light)
    200: { value: '#fafafa' }, // outline hover / ghost active (light)
    300: { value: '#bbbbbb' }, // outline active (light)
    500: { value: '#000000' }, // base solid
    550: { value: '#262626' }, // custom (auth bg)
    600: { value: '#353535' }, // solid hover
    650: { value: '#0a0a0a' }, // custom
    700: { value: '#2e2e2e' }, // solid active
    800: { value: '#3f3f3f' }, // link active (dark)
  },

  gray: {
    50: { value: '#fcfcfc' },
    100: { value: 'whitesmoke' },
    400: { value: '#b2b2b2' },
    500: { value: '#737373' },
  },
}

const radii = {
  none: { value: '0rem' },
  xxs: { value: '2px' },
  xs: { value: '4px' },
  sm: { value: '6px' },
  md: { value: '8px' },
  lg: { value: '10px' },
  xl: { value: '12px' },
  '2xl': { value: '16px' },
  '3xl': { value: '20px' },
  '4xl': { value: '24px' },
  full: { value: '9999px' },
}

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

type ColorMode = 'light' | 'dark'
export const rainbowStyles = (colormode: ColorMode) => {
  if (colormode === 'light') {
    return lightTheme({
      accentColor: 'white',
      accentColorForeground: 'green',
      borderRadius: 'medium',
    })
  }

  return darkTheme({
    accentColor: 'white',
    accentColorForeground: 'green',
    borderRadius: 'medium',
  })
}
