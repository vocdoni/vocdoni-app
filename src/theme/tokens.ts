import { defineTokens } from '@chakra-ui/react'
import { colors } from './colors'

const sidebarWidth = '350px'
const maxNavbarWidth = '1920px'

const fonts = defineTokens.fonts({
  body: { value: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif` },
  heading: { value: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif` },
  mono: { value: `'Menlo', monospace` },
})

const fontWeights = defineTokens.fontWeights({
  normal: { value: '300' },
  bold: { value: '400' },
})

const radii = defineTokens.radii({
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
})

const spacing = defineTokens.spacing({ sidebar: { value: sidebarWidth } })

const sizes = defineTokens.sizes({
  sidebar: { value: sidebarWidth },
  navbar: { value: maxNavbarWidth },
  'dashboard-menu': {
    default: { value: '255px' },
    reduced: { value: '48px' },
  },
  'voting-page': { value: '1200px' },
})

const zIndex = defineTokens.zIndex({
  background: { value: 0 },
  contents: { value: 1 },
  sidebar: { value: 2 },
  modal: { value: 1400 },
  hovering: { value: 1500 },
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
