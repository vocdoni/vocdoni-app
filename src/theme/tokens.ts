import { defineTokens } from '@chakra-ui/react'
import { colors } from './colors'
import { FONT_STACKS, type LoadedFontWeight } from './fonts'

const sidebarWidth = '350px'

const fonts = defineTokens.fonts({
  body: { value: FONT_STACKS.body },
  heading: { value: FONT_STACKS.heading },
  mono: { value: FONT_STACKS.mono },
})

// Only loaded weights (see fonts.ts): a name with no file behind it makes the browser fake it.
// Headings, `bold` and <b>/<strong> are 500, running text and labels 400; chakra's stock names
// for weights that do not ship are pinned to the nearest loaded one.
const weight = (value: LoadedFontWeight) => ({ value: String(value) })

const fontWeights = defineTokens.fontWeights({
  thin: weight(300),
  extralight: weight(300),
  light: weight(300),
  normal: weight(400),
  medium: weight(400),
  semibold: weight(500),
  bold: weight(500),
  bolder: weight(500),
  extrabold: weight(500),
  black: weight(500),
})

const radii = defineTokens.radii({
  none: { value: '0rem' },
  xs: { value: '4px' },
  sm: { value: '6px' },
  md: { value: '8px' },
  lg: { value: '10px' },
  xl: { value: '12px' },
  '2xl': { value: '16px' },
  full: { value: '9999px' },
})

const spacing = defineTokens.spacing({
  sidebar: { value: '{sizes.sidebar}' },
})

const sizes = defineTokens.sizes({
  'cookies-consent': { value: '720px' },
  'dashboard-menu': {
    default: { value: '255px' },
    reduced: { value: '48px' },
  },
  'max-window-width': { value: '2560px' },
  'max-content-width': { value: '1200px' },
  navbar: { value: '1920px' },
  sidebar: { value: sidebarWidth },
  'user-profile': { value: '280px' },
  voting: {
    sidebar: { value: '320px' },
    contents: {
      min: { value: 'calc(640px + var(--chakra-sizes-voting-sidebar))' },
      max: { value: '1560px' },
    },
  },
})

const zIndex = defineTokens.zIndex({
  background: { value: 0 },
  contents: { value: 1 },
  sidebar: { value: 2 },
  topbar: { value: 3 },
  top: { value: 9999 },
})

const tokens = defineTokens({
  colors,
  radii,
  sizes,
  spacing,
  zIndex,
  fonts,
  fontWeights,
})

export default tokens
