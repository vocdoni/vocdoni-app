import { defineTokens } from '@chakra-ui/react'
import { colors } from './colors'
import { FONT_STACKS, FONT_WEIGHTS } from './fonts'

const fonts = defineTokens.fonts({
  body: { value: FONT_STACKS.body },
  heading: { value: FONT_STACKS.heading },
  figure: { value: FONT_STACKS.figure },
  mono: { value: FONT_STACKS.mono },
})

// One token per step of the ladder in fonts.ts, which sits next to the family so the two change together.
const fontWeights = defineTokens.fontWeights(
  Object.fromEntries(Object.entries(FONT_WEIGHTS).map(([name, weight]) => [name, { value: String(weight) }]))
)

// Fil's smaller steps, over Chakra's `xs` to `2xl`; `control` is the size of a control's label and value
// (button, field, menu item). `2xs` and `3xl` upward stay Chakra's.
const fontSizes = defineTokens.fontSizes({
  xs: { value: '0.75rem' },
  sm: { value: '0.8125rem' },
  control: { value: '0.84375rem' },
  md: { value: '0.875rem' },
  lg: { value: '1rem' },
  xl: { value: '1.25rem' },
  '2xl': { value: '1.75rem' },
})

// The app's four line heights: captions and figures, titles, running text, long reads. Chakra's
// other step (`taller`) stays for its own recipes.
const lineHeights = defineTokens.lineHeights({
  shorter: { value: 1.2 },
  short: { value: 1.3 },
  moderate: { value: 1.5 },
  tall: { value: 1.6 },
})

// Tracking that falls between Chakra's letterSpacings steps: the body, and the tighter steps of larger type.
const letterSpacings = defineTokens.letterSpacings({
  none: { value: '0em' },
  body: { value: '-0.006em' },
  heading: {
    snug: { value: '-0.4px' },
    item: { value: '-0.015em' },
    section: { value: '-0.028em' },
    page: { value: '-0.035em' },
  },
  quote: {
    tight: { value: '-0.3px' },
  },
})

const borderWidths = defineTokens.borderWidths({
  hairline: { value: '1px' },
  thick: { value: '2px' },
  // Hand-drawn focus rings (outline or box-shadow), as wide as Chakra's own.
  focusRing: { value: '{borderWidths.thick}' },
  // The ring of a checkbox or radio, and the filled ring that is a checked radio's mark.
  mark: { value: '1.5px' },
  radio: { value: '5px' },
})

const radii = defineTokens.radii({
  none: { value: '0rem' },
  xs: { value: '3px' },
  sm: { value: '4px' },
  md: { value: '6px' },
  lg: { value: '6px' },
  xl: { value: '12px' },
  '2xl': { value: '12px' },
  full: { value: '9999px' },
})

// `0` and `auto` are everyday values Chakra's scale lacks (it starts at 0.5), so they are tokens, not `[0]` /
// `[auto]` escapes; `auto` is what lets a margin push or centre.
// `dashboard.panel` lets a margin make room for the dashboard's side panel.
const spacing = defineTokens.spacing({
  '0': { value: '0' },
  auto: { value: 'auto' },
  // Gutter between a segmented control's track and its items.
  track: { value: '3px' },
  dashboard: {
    panel: { value: '{sizes.dashboard.panel}' },
  },
})

// `0` and `auto` are likewise missing from Chakra's sizes.
const sizes = defineTokens.sizes({
  '0': { value: '0' },
  auto: { value: 'auto' },
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
  // The status dot (7px).
  dot: { value: '7px' },
  // The four icon sizes (inline, control, feature, empty state). sm–lg are Chakra's Icon sizes, so
  // `boxSize='icon.md'` and `<Icon size='md'>` cannot drift apart.
  icon: {
    sm: { value: '{sizes.4}' },
    md: { value: '{sizes.5}' },
    lg: { value: '{sizes.6}' },
    xl: { value: '{sizes.12}' },
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
  // Square controls drawn by recipes: the support chat launcher (button `floating`) and link `icon-button`.
  control: {
    floating: { value: '52px' },
    'icon-link': { value: '30px' },
    // Fil's default control height, shared by buttons, inputs and selects.
    md: { value: '34px' },
    // Minimum height of a textarea.
    area: { value: '76px' },
  },
  // Minimum height of ui/Loader's PageLoader, so a page with nothing yet does not collapse.
  loader: { value: '300px' },
  // Width of the Vocdoni wordmark image.
  wordmark: { value: '125px' },
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
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
})

export default tokens
