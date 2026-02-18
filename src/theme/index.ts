import { ColorMode, extendTheme } from '@chakra-ui/react'
import { darkTheme, lightTheme } from '@rainbow-me/rainbowkit'
import { theme as vtheme } from '@vocdoni/chakra-components'
import { colors } from './colors'
import components from './components'
import editor from './editor'
import radii from './radius'
import semanticTokens from './semantic'

import '@fontsource/inter/300.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/index.css'
import { MaxNavbarWidth } from '~constants'

const sidebarWidth = '350px'

export const theme = extendTheme(vtheme, {
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    body: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif`,
    heading: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif`,
    mono: `'Menlo', monospace`,
  },
  semanticTokens,
  styles: {
    global: (props) => ({
      ':root': {
        '--box-shadow': '0 0 10px #e3e3e3',
        '--box-shadow-dark-mode': '0 0 10px #101010',
        '--border': '1px solid rgb(228, 228, 231)',
        '--shadow-sm': '0 1px 2px 0 rgb(0 0 0/0.05)',
      },
      body: {
        fontWeight: 'normal',
      },
      ...editor,
    }),
  },
  components,
  colors,
  radii,
  space: { sidebar: sidebarWidth },
  sizes: {
    sidebar: sidebarWidth,
    navbar: MaxNavbarWidth,
    'modal-stretch': 'calc(100% + var(--chakra-space-5)*2 + var(--chakra-space-6)*2)',
    'modal-stretch-lg': 'calc(100% + var(--chakra-space-10)*2 + var(--chakra-space-6)*2)',
    'voting-page': '1200px',
  },
  zIndices: {
    background: 0,
    contents: 1,
    sidebar: 2,
    modal: 1400,
    hovering: 1500,
  },
})

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
