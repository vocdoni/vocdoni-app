import { defineTokens } from '@chakra-ui/react'
import { colors } from './colors'

const sidebarWidth = '350px'

const fonts = defineTokens.fonts({
  body: { value: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif` },
  heading: { value: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif` },
  mono: { value: `'Menlo', monospace` },
})

const fontWeights = defineTokens.fontWeights({
  normal: { value: '300' },
  medium: { value: '300' },
  bold: { value: '400' },
  bolder: { value: '500' },
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

const spacing = defineTokens.spacing({
  sidebar: { value: sidebarWidth },
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
  modal: { value: 1400 },
  hovering: { value: 1500 },
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
