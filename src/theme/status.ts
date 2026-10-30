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

// fg/bg/border alias chakra's own status roles (`fg.error`, `bg.warning`…), so code that reads
// those directly and code that reads `status.*` render the same.
const tone = (name: Exclude<StatusTone, 'neutral'>, palette: string) => ({
  fg: { value: `{colors.fg.${name}}` },
  bg: { value: `{colors.bg.${name}}` },
  border: { value: `{colors.border.${name}}` },
  // Running text on the tone's own `bg`
  emphasis: { value: { _light: `{colors.${palette}.900}`, _dark: `{colors.${palette}.100}` } },
  solid: { value: `{colors.${palette}.solid}` },
  contrast: { value: `{colors.${palette}.contrast}` },
})

export const statusColors = defineSemanticTokens.colors({
  status: {
    success: tone('success', statusPalette.success),
    warning: tone('warning', statusPalette.warning),
    error: tone('error', statusPalette.error),
    info: tone('info', statusPalette.info),
    neutral: {
      fg: { value: '{colors.fg.muted}' },
      bg: { value: '{colors.bg.muted}' },
      border: { value: '{colors.border}' },
      solid: { value: '{colors.gray.solid}' },
      contrast: { value: '{colors.gray.contrast}' },
    },
  },
  // Actions that delete or end something: menu items, icon buttons, confirm buttons. Text steps up
  // to red.400 in dark mode, where red.600 is too dark to read on the dark surfaces.
  destructive: {
    fg: { value: { _light: '{colors.red.600}', _dark: '{colors.red.400}' } },
    solid: { value: '{colors.red.solid}' },
    contrast: { value: '{colors.red.contrast}' },
  },
})
