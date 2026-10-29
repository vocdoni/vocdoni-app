import { defineSemanticTokens } from '@chakra-ui/react'

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'neutral'

// Palette names for `colorPalette` props (badges, tags, progress bars). They match the palettes
// chakra's Alert picks for its `status` prop, so inline alerts and chips agree.
export const statusPalette = {
  success: 'green',
  warning: 'orange',
  error: 'red',
  info: 'blue',
  neutral: 'gray',
  destructive: 'red',
} as const satisfies Record<StatusTone | 'destructive', string>

// Hues a few screens pick instead of the shared ones above.
export const statusPaletteAlt = {
  warning: 'yellow',
  success: 'teal',
} as const

// Fixed hues that don't follow PRIMARY_COLOR.
export const accentPalette = {
  blue: 'blue',
  purple: 'purple',
  teal: 'teal',
} as const

// fg/bg/border alias chakra's own status roles (`fg.error`, `bg.warning`…), so code that reads
// those directly and code that reads `status.*` render the same.
const tone = (name: Exclude<StatusTone, 'neutral'>, palette: string) => ({
  fg: { value: `{colors.fg.${name}}` },
  bg: { value: `{colors.bg.${name}}` },
  border: { value: `{colors.border.${name}}` },
  solid: { value: `{colors.${palette}.solid}` },
  contrast: { value: `{colors.${palette}.contrast}` },
})

export const statusColors = defineSemanticTokens.colors({
  status: {
    success: {
      ...tone('success', statusPalette.success),
      // Steps single call sites use instead of `fg`.
      alt: {
        400: { value: '{colors.green.400}' },
        500: { value: '{colors.green.500}' },
        paired: { value: { _light: '{colors.green.500}', _dark: '{colors.green.300}' } },
      },
    },
    warning: {
      ...tone('warning', statusPalette.warning),
      alt: {
        400: { value: '{colors.orange.400}' },
      },
    },
    error: {
      ...tone('error', statusPalette.error),
      alt: {
        500: { value: '{colors.red.500}' },
      },
    },
    info: tone('info', statusPalette.info),
    neutral: {
      fg: { value: '{colors.fg.muted}' },
      bg: { value: '{colors.bg.muted}' },
      border: { value: '{colors.border}' },
      solid: { value: '{colors.gray.solid}' },
      contrast: { value: '{colors.gray.contrast}' },
    },
  },
  // Actions that delete or end something: menu items, icon buttons, confirm buttons.
  destructive: {
    fg: { value: '{colors.fg.error}' },
    solid: { value: '{colors.red.solid}' },
    contrast: { value: '{colors.red.contrast}' },
    alt: {
      400: { value: '{colors.red.400}' },
      500: { value: '{colors.red.500}' },
      solid: { value: { _light: '{colors.red.600}', _dark: '{colors.red.800}' } },
      hover: { value: { _light: '{colors.red.700}', _dark: '{colors.red.900}' } },
    },
  },
  accent: {
    blue: {
      400: { value: '{colors.blue.400}' },
      500: { value: '{colors.blue.500}' },
    },
  },
})
