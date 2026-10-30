import { defineTokens } from '@chakra-ui/react'
import { colors } from './colors'
import { FONT_STACKS, type LoadedFontWeight } from './fonts'

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

// The app's four line heights (D3): captions and figures, titles, running text, long reads. Chakra's
// other step (`taller`) stays for its own recipes.
const lineHeights = defineTokens.lineHeights({
  shorter: { value: 1.2 },
  short: { value: 1.3 },
  moderate: { value: 1.5 },
  tall: { value: 1.6 },
})

// Display-text tracking that falls between Chakra's letterSpacings steps.
const letterSpacings = defineTokens.letterSpacings({
  heading: {
    snug: { value: '-0.4px' },
  },
  quote: {
    tight: { value: '-0.3px' },
  },
  eyebrow: {
    wide: { value: '0.14em' },
  },
})

const borderWidths = defineTokens.borderWidths({
  hairline: { value: '1px' },
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

// So a margin can make room for the dashboard's side panel.
const spacing = defineTokens.spacing({
  dashboard: {
    panel: { value: '{sizes.dashboard.panel}' },
  },
})

const sizes = defineTokens.sizes({
  'cookies-consent': { value: '720px' },
  // The dashboard shell: the menu expanded and collapsed, its logo row and the right side panel.
  dashboard: {
    menu: {
      expanded: { value: '255px' },
      collapsed: { value: '48px' },
    },
    header: { value: '47px' },
    panel: { value: '350px' },
  },
  // The four icon sizes (inline, control, feature, empty state), in rem like spacing 4/5/6/12.
  icon: {
    sm: { value: '1rem' },
    md: { value: '1.25rem' },
    lg: { value: '1.5rem' },
    xl: { value: '3rem' },
  },
  // The three page widths, read through ui/PageContainer: the public shell, then two narrower columns.
  content: {
    wide: { value: '1600px' },
    medium: { value: '1200px' },
    narrow: { value: '900px' },
  },
  // Empty-state cards (no organizations, no results) and the leading column of a table that holds row actions.
  card: {
    empty: { value: '650px' },
  },
  table: {
    action: { value: '50px' },
  },
  // Minimum height of a row of controls, so a row with a button and one without line up.
  toolbar: { value: '42px' },
  'user-profile': { value: '280px' },
  voting: {
    sidebar: { value: '320px' },
    contents: {
      min: { value: 'calc(640px + var(--chakra-sizes-voting-sidebar))' },
    },
  },
})

const zIndex = defineTokens.zIndex({
  background: { value: 0 },
  contents: { value: 1 },
  sidebar: { value: 2 },
  topbar: { value: 3 },
  top: { value: 9999 },
  'public-header': { value: 30 },
  'dashboard-menu': { value: 100 },
})

// Chakra's durations have no zero; `visibility` needs one to flip at once while a delay holds the other end.
const durations = defineTokens.durations({
  instant: { value: '0s' },
})

// Two fades. `inactive` is content that cannot be used right now (a revoked key, a busy check, an unavailable
// option); `dimmed` is only de-emphasised and matches Chakra's own `_disabled` layer style (0.5).
const opacity = defineTokens.opacity({
  inactive: { value: 0.6 },
  dimmed: { value: 0.5 },
})

const tokens = defineTokens({
  borderWidths,
  colors,
  durations,
  opacity,
  radii,
  sizes,
  spacing,
  zIndex,
  fonts,
  fontWeights,
  lineHeights,
  letterSpacings,
})

export default tokens
